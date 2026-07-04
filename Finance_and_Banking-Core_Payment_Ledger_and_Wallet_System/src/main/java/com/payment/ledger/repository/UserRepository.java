package com.payment.ledger.repository;

import com.payment.ledger.entity.User;
import com.payment.ledger.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    boolean existsByEmailAndAccountStatus(String email, AccountStatus accountStatus);
    boolean existsByUsernameAndAccountStatus(String username, AccountStatus accountStatus);
}