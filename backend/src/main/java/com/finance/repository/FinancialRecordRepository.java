package com.finance.repository;

import com.finance.entity.FinancialRecord;
import com.finance.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinancialRecordRepository extends JpaRepository<FinancialRecord, Long> {
    Page<FinancialRecord> findByUserIdAndDeletedFalseOrderByRecordDateDesc(Long userId, Pageable pageable);

    Page<FinancialRecord> findByUserIdAndDeletedFalseAndRecordDateBetweenOrderByRecordDateDesc(
            Long userId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<FinancialRecord> findByUserIdAndDeletedFalseAndCategoryOrderByRecordDateDesc(
            Long userId, String category, Pageable pageable);

    Page<FinancialRecord> findByUserIdAndDeletedFalseAndTypeOrderByRecordDateDesc(
            Long userId, TransactionType type, Pageable pageable);

    @Query(value = "SELECT SUM(fr.amount) FROM financial_records fr WHERE fr.user_id = :userId AND (fr.deleted = false OR fr.deleted IS NULL) AND fr.type = 'INCOME'", nativeQuery = true)
    BigDecimal getTotalIncomeByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT SUM(fr.amount) FROM financial_records fr WHERE fr.user_id = :userId AND (fr.deleted = false OR fr.deleted IS NULL) AND fr.type = 'EXPENSE'", nativeQuery = true)
    BigDecimal getTotalExpenseByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT COUNT(fr.id) FROM financial_records fr WHERE fr.user_id = :userId AND (fr.deleted = false OR fr.deleted IS NULL)", nativeQuery = true)
    long getRecordCountByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT COUNT(fr.id) FROM financial_records fr WHERE fr.user_id = :userId AND (fr.deleted = false OR fr.deleted IS NULL) AND fr.type = 'INCOME'", nativeQuery = true)
    long getIncomeCountByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT COUNT(fr.id) FROM financial_records fr WHERE fr.user_id = :userId AND (fr.deleted = false OR fr.deleted IS NULL) AND fr.type = 'EXPENSE'", nativeQuery = true)
    long getExpenseCountByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT COUNT(*) FROM financial_records WHERE user_id = :userId", nativeQuery = true)
    long countAllRecordsByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT * FROM financial_records WHERE user_id = :userId", nativeQuery = true)
    List<FinancialRecord> findAllByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT * FROM financial_records fr WHERE fr.user_id = :userId AND (fr.deleted = false OR fr.deleted IS NULL) ORDER BY fr.record_date DESC", nativeQuery = true)
    List<FinancialRecord> findByUserIdAndDeletedFalseOrderByRecordDateDesc(@Param("userId") Long userId);

    @Query("SELECT fr FROM FinancialRecord fr WHERE " +
           "fr.user.id = :userId AND fr.deleted = false AND " +
           "(:type IS NULL OR fr.type = :type) AND " +
           "(:category IS NULL OR fr.category = :category) AND " +
           "(:search IS NULL OR LOWER(fr.description) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))) AND " +
           "(:startDate IS NULL OR fr.recordDate >= :startDate) AND " +
           "(:endDate IS NULL OR fr.recordDate <= :endDate) AND " +
           "(:minAmount IS NULL OR fr.amount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR fr.amount <= :maxAmount) ORDER BY fr.recordDate DESC")
    Page<FinancialRecord> findWithFilters(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("category") String category,
            @Param("search") String search,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount,
            Pageable pageable);
}
