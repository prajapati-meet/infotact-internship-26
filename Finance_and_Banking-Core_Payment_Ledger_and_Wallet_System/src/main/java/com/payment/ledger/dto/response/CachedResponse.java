package com.payment.ledger.dto.response;

public class CachedResponse {

    private int statusCode;
    private Object body;

    public CachedResponse() {
        super();
    }

    public CachedResponse(int statusCode, Object body) {
        this.statusCode = statusCode;
        this.body = body;
    }

    public int getStatusCode() { return statusCode; }
    public void setStatusCode(int statusCode) { this.statusCode = statusCode; }

    public Object getBody() { return body; }
    public void setBody(Object body) { this.body = body; }
}