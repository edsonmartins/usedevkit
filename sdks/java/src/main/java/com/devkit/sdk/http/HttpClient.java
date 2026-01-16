package com.devkit.sdk.http;

import com.devkit.sdk.exception.AuthenticationException;
import com.devkit.sdk.exception.DevKitException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import okhttp3.*;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * HTTP client for communicating with DevKit API.
 */
public class HttpClient {

    private final OkHttpClient client;
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final String apiKey;

    public HttpClient(String baseUrl, String apiKey, int timeoutMs) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.apiKey = apiKey;

        this.client = new OkHttpClient.Builder()
                .connectTimeout(timeoutMs, TimeUnit.MILLISECONDS)
                .readTimeout(timeoutMs, TimeUnit.MILLISECONDS)
                .writeTimeout(timeoutMs, TimeUnit.MILLISECONDS)
                .addInterceptor(this::addAuthInterceptor)
                .addInterceptor(this::errorHandlingInterceptor)
                .build();

        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    private Response addAuthInterceptor(Interceptor.Chain chain) throws IOException {
        Request original = chain.request();
        Request request = original.newBuilder()
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .method(original.method(), original.body())
                .build();
        return chain.proceed(request);
    }

    private Response errorHandlingInterceptor(Interceptor.Chain chain) throws IOException {
        try {
            Response response = chain.proceed(chain.request());
            if (response.code() == 401) {
                response.close();
                throw new AuthenticationException("Invalid API key");
            }
            return response;
        } catch (IOException e) {
            throw new DevKitException("Network error", e);
        }
    }

    public <T> T get(String path, Class<T> responseType) {
        Request request = new Request.Builder()
                .url(baseUrl + path)
                .get()
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new DevKitException("HTTP error: " + response.code());
            }
            String body = response.body().string();
            return objectMapper.readValue(body, responseType);
        } catch (IOException e) {
            throw new DevKitException("Failed to parse response", e);
        }
    }

    public <T> T post(String path, Object body, Class<T> responseType) {
        try {
            String json = objectMapper.writeValueAsString(body);
            RequestBody requestBody = RequestBody.create(
                    json,
                    MediaType.parse("application/json")
            );

            Request request = new Request.Builder()
                    .url(baseUrl + path)
                    .post(requestBody)
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    throw new DevKitException("HTTP error: " + response.code());
                }
                String responseBody = response.body().string();
                return objectMapper.readValue(responseBody, responseType);
            }
        } catch (Exception e) {
            throw new DevKitException("Failed to execute POST request", e);
        }
    }

    public <T> T put(String path, Object body, Class<T> responseType) {
        try {
            String json = objectMapper.writeValueAsString(body);
            RequestBody requestBody = RequestBody.create(
                    json,
                    MediaType.parse("application/json")
            );

            Request request = new Request.Builder()
                    .url(baseUrl + path)
                    .put(requestBody)
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    throw new DevKitException("HTTP error: " + response.code());
                }
                String responseBody = response.body().string();
                return objectMapper.readValue(responseBody, responseType);
            }
        } catch (Exception e) {
            throw new DevKitException("Failed to execute PUT request", e);
        }
    }

    public void delete(String path) {
        Request request = new Request.Builder()
                .url(baseUrl + path)
                .delete()
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful() && response.code() != 204) {
                throw new DevKitException("HTTP error: " + response.code());
            }
        } catch (IOException e) {
            throw new DevKitException("Failed to execute DELETE request", e);
        }
    }
}
