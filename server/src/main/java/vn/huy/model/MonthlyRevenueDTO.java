package vn.huy.model;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyRevenueDTO {
private int month;
    private int year;
    private long orderCount;
    private BigDecimal totalRevenue;
    
}
