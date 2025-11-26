package vn.huy.service;

import vn.huy.controller.request.AddBillDetailRequest;
import vn.huy.controller.request.CreateBillRequest;
import vn.huy.controller.response.BillDetailResponse;
import vn.huy.controller.response.BillResponse;
import vn.huy.controller.response.BillWithDetailsResponse;
import vn.huy.model.UserPrincipal;

import java.util.List;

public interface BillService {
    void createBill(Long reservationId);

    List<BillResponse> getAllBills(UserPrincipal currentUser);

    BillResponse createBill(CreateBillRequest request, UserPrincipal currentUser);

    BillWithDetailsResponse getBillDetails(Long billId, UserPrincipal currentUser);

    BillDetailResponse addBillDetail(Long billId, AddBillDetailRequest request, UserPrincipal currentUser);
}
