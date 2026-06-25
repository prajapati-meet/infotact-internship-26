package com.payment.ledger.service;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.payment.ledger.exception.InvalidIdempotencyKeyException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;


@ExtendWith(MockitoExtension.class)
 class IdempotencyServiceImplTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private IdempotencyServiceImpl idempotencyService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void executeIdempotent_WithNewKey_ShouldExecuteOperation() {

        String idempotencyKey = "test-key";
        String lockKey = "idempotency:lock:" + idempotencyKey;
        String responseKey = "idempotency:response:" + idempotencyKey;
        String expectedResponse = "SUCCESS";

        AtomicInteger executionCount = new AtomicInteger(0);

        // No cached response exists
        when(valueOperations.get(responseKey)).thenReturn(null);

        // Lock acquisition succeeds
        when(valueOperations.setIfAbsent(
                eq(lockKey),
                eq("PROCESSING"),
                eq(Duration.ofSeconds(30))
        )).thenReturn(true);

        // Act
        String result = idempotencyService.executeIdempotent(
                idempotencyKey,
                String.class,
                () -> {
                    executionCount.incrementAndGet();
                    return expectedResponse;
                }
        );

        // Assert
        assertEquals(expectedResponse, result);
        assertEquals(1, executionCount.get());

        // Verify response cached
        verify(valueOperations).set(
                eq(responseKey),
                eq(expectedResponse),
                eq(Duration.ofHours(24))
        );

        // Verify lock removed
        verify(redisTemplate).delete(lockKey);

        // Verify operation executed exactly once
        verify(valueOperations).get(responseKey);
        verify(valueOperations).setIfAbsent(
                eq(lockKey),
                eq("PROCESSING"),
                eq(Duration.ofSeconds(30))
        );
        
    }
     @Test
    void executeIdempotent_WithExistingResponse_ShouldNotExecuteOperation() {

        String idempotencyKey = "test-key";
        String responseKey = "idempotency:response:" + idempotencyKey;
        String cachedResponse = "SUCCESS";

        AtomicInteger executionCount = new AtomicInteger(0);

        
        when(valueOperations.get(responseKey)).thenReturn(cachedResponse);

      
        String result = idempotencyService.executeIdempotent(
                idempotencyKey,
                String.class,
                () -> {
                    executionCount.incrementAndGet();
                    return "NEW_RESPONSE";
                }
        );

       
        assertEquals(cachedResponse, result);
        assertEquals(0, executionCount.get());

        verify(valueOperations).get(responseKey);

       
        verify(valueOperations, never())
                .setIfAbsent(anyString(), any(), any(Duration.class));

        // Verify no cache write
        verify(valueOperations, never())
                .set(anyString(), any(), any(Duration.class));

        
        verify(redisTemplate, never()).delete(anyString());
    }




    @Test
    void executeIdempotent_WhenLockFailsAndNoResponse_ShouldThrowException() {

        String idempotencyKey = "test-key";
        String lockKey = "idempotency:lock:" + idempotencyKey;
        String responseKey = "idempotency:response:" + idempotencyKey;

        AtomicInteger executionCount = new AtomicInteger(0);

        // No cached response exists
        when(valueOperations.get(responseKey)).thenReturn(null);

        // Lock acquisition fails
        when(valueOperations.setIfAbsent(
                eq(lockKey),
                eq("PROCESSING"),
                eq(Duration.ofSeconds(30))
        )).thenReturn(false);

        // Verify exception is thrown
        assertThrows(
                InvalidIdempotencyKeyException.class,
                () -> idempotencyService.executeIdempotent(
                        idempotencyKey,
                        String.class,
                        () -> {
                            executionCount.incrementAndGet();
                            return "SUCCESS";
                        }
                )
        );

        // Operation should not execute
        assertEquals(0, executionCount.get());

        // Verify cache lookup happened twice
        verify(valueOperations, times(2)).get(responseKey);

        // Verify lock acquisition attempt
        verify(valueOperations).setIfAbsent(
                eq(lockKey),
                eq("PROCESSING"),
                eq(Duration.ofSeconds(30))
        );

        // Verify no response cached
        verify(valueOperations, never())
                .set(anyString(), any(), any(Duration.class));

        // Verify lock not deleted
        verify(redisTemplate, never()).delete(anyString());
    }

}
