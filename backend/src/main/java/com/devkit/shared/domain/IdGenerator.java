package com.devkit.shared.domain;

import io.hypersistence.tsid.TSID;

/**
 * Generator for unique identifiers using TSID (Time-Sorted ID).
 * TSIDs are sortable by time, similar to UUIDv1, but without the privacy concerns.
 */
public class IdGenerator {

    private IdGenerator() {}

    /**
     * Generate a new TSID as String.
     * @return a unique identifier as String
     */
    public static String generateString() {
        return TSID.Factory.getTsid().toString();
    }

    /**
     * Generate a new TSID as Long.
     * @return a unique identifier as Long
     */
    public static Long generateLong() {
        return TSID.Factory.getTsid().toLong();
    }
}
