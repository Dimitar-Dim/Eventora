package com.dimitar.eventora.repository;

import com.dimitar.eventora.entity.TicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<TicketEntity, Long> {
    Optional<TicketEntity> findByQrCode(String qrCode);
    long countByEventId(Long eventId);
    List<TicketEntity> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    List<TicketEntity> findAllByEventId(Long eventId);
}
