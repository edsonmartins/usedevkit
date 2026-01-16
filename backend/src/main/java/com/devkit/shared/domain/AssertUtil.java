package com.devkit.shared.domain;

/**
 * Utility class for validating input parameters.
 * Provides static methods to enforce preconditions and throw exceptions for invalid inputs.
 */
public class AssertUtil {

    private AssertUtil() {}

    /**
     * Ensures that the given object is not null.
     * @param obj the object to check
     * @param message the exception message if the object is null
     * @return the object if it's not null
     * @throws IllegalArgumentException if the object is null
     */
    public static <T> T requireNotNull(T obj, String message) {
        if (obj == null) {
            throw new IllegalArgumentException(message);
        }
        return obj;
    }

    /**
     * Ensures that the given string is not null or blank.
     * @param str the string to check
     * @param message the exception message if the string is null or blank
     * @return the string if it's not null or blank
     * @throws IllegalArgumentException if the string is null or blank
     */
    public static String requireNotBlank(String str, String message) {
        if (str == null || str.trim().isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return str;
    }

    /**
     * Ensures that the given number is positive.
     * @param num the number to check
     * @param message the exception message if the number is not positive
     * @return the number if it's positive
     * @throws IllegalArgumentException if the number is not positive
     */
    public static int requirePositive(int num, String message) {
        if (num <= 0) {
            throw new IllegalArgumentException(message);
        }
        return num;
    }
}
