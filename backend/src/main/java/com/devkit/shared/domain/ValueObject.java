package com.devkit.shared.domain;

import java.io.Serializable;

/**
 * Base class for value objects.
 */
public abstract class ValueObject implements Serializable {

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        return toString().equals(o.toString());
    }

    @Override
    public int hashCode() {
        return toString().hashCode();
    }
}
