package com.payment.ledger.repository;


import com.payment.ledger.entity.User;
import com.payment.ledger.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {

    Optional<Wallet> findByUser(User user);

    Optional<Wallet> findByUserId(UUID userId);

}
