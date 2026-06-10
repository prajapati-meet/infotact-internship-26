package com.ledger.repository;

import com.ledger.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {

    List<LedgerEntry> findByWalletIdOrderByCreatedAtDesc(UUID walletId);

    Optional<LedgerEntry> findByReferenceId(String referenceId);

    boolean existsByReferenceId(String referenceId);
}
