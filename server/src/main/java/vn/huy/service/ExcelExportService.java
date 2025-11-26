package vn.huy.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import vn.huy.model.MonthlyRevenueDTO;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.DecimalFormat;
import java.util.List;

@Service
public class ExcelExportService {

    public ByteArrayInputStream exportRevenueToExcel(List<MonthlyRevenueDTO> revenueList) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("Doanh Thu Theo Tháng");

            // 1. Tạo Font cho tiêu đề (In đậm)
            CellStyle headerCellStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerCellStyle.setFont(headerFont);

            // 2. Tạo hàng tiêu đề (Header)
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Tháng / Năm", "Số lượng đơn", "Doanh thu tháng"};

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // 3. Đổ dữ liệu vào các dòng
            int rowIdx = 1;
            DecimalFormat df = new DecimalFormat("#,### VNĐ"); // Định dạng tiền tệ

            for (MonthlyRevenueDTO item : revenueList) {
                Row row = sheet.createRow(rowIdx++);

                // Cột 0: Tháng/Năm
                row.createCell(0).setCellValue("Tháng " + item.getMonth() + "/" + item.getYear());

                // Cột 1: Số lượng đơn
                row.createCell(1).setCellValue(item.getOrderCount() + " đơn");

                // Cột 2: Doanh thu (Đã định dạng)
                row.createCell(2).setCellValue(df.format(item.getTotalRevenue()));
            }

            // 4. Tự động giãn độ rộng cột cho đẹp
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi tạo file Excel: " + e.getMessage());
        }
    }
}