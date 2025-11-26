package vn.huy.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.huy.controller.request.AddBillDetailRequest;
import vn.huy.controller.request.CreateBillRequest;
import vn.huy.controller.response.ApiResponse;
import vn.huy.controller.response.BillDetailResponse;
import vn.huy.controller.response.BillResponse;
import vn.huy.controller.response.BillWithDetailsResponse;
import vn.huy.model.UserPrincipal;
import vn.huy.service.BillService;

import java.util.List;

@Slf4j(topic = "BILL-CONTROLLER")
@RestController
@RequestMapping("/bills")
@RequiredArgsConstructor
@Tag(name = "Bills", description = "Bill management")
public class BillController {
    private final BillService  billService;

        @Operation(summary = "List of invoices (Admin, Staff, Customer)")
    @GetMapping
        @PreAuthorize("hasAnyAuthority('Admin', 'Staff', 'User')")
        public ResponseEntity<ApiResponse<List<BillResponse>>> getAllBills(
            @AuthenticationPrincipal vn.huy.model.User currentUser
        ) {
        vn.huy.model.UserPrincipal principal = new vn.huy.model.UserPrincipal(
            currentUser.getId(), currentUser.getUsername(), currentUser.getPassword(), currentUser.getAuthorities()
        );
        List<BillResponse> bills = billService.getAllBills(principal);

        return ResponseEntity.ok(
                ApiResponse.success("List of invoices", bills)
        );
    }

    @Operation(summary = "Create bill (Admin, Staff)")
    @PostMapping
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
        public ResponseEntity<ApiResponse<BillResponse>> createBill(
            @Valid @RequestBody CreateBillRequest request,
            @AuthenticationPrincipal vn.huy.model.User currentUser
        ) {
        vn.huy.model.UserPrincipal principal = new vn.huy.model.UserPrincipal(
            currentUser.getId(), currentUser.getUsername(), currentUser.getPassword(), currentUser.getAuthorities()
        );
        BillResponse response = billService.createBill(request, principal);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bill has been created", response));
    }

    @GetMapping("/{id}/details")
        @PreAuthorize("hasAnyAuthority('Admin', 'Staff', 'User')")
        public ResponseEntity<ApiResponse<BillWithDetailsResponse>> getBillDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal vn.huy.model.User currentUser
        ) {
        vn.huy.model.UserPrincipal principal = new vn.huy.model.UserPrincipal(
            currentUser.getId(), currentUser.getUsername(), currentUser.getPassword(), currentUser.getAuthorities()
        );
        BillWithDetailsResponse response = billService.getBillDetails(id, principal);

        return ResponseEntity.ok(
                ApiResponse.success("Invoice details", response)
        );
    }

    @Operation(summary = "Add services to invoice (Admin, Staff)")
    @PostMapping("/{id}/details")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<ApiResponse<BillDetailResponse>> addServiceToBill(
            @PathVariable Long id,
            @Valid @RequestBody AddBillDetailRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        BillDetailResponse response = billService.addBillDetail(id, request, currentUser);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service has been added to the bill", response));
    }

}
