package com.noizeramp.nsfcm;

/**
 * Plugin listener.
 */
public interface Listener {
    void callback(Object data);
    void callback(Object message, Object data);
}
