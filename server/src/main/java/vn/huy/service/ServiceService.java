package vn.huy.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.huy.controller.request.ServiceCreationRequest;
import vn.huy.controller.request.ServiceGroupCreationRequest;
import vn.huy.controller.request.ServiceUpdateRequest;
import vn.huy.controller.response.ServiceResponse;
import vn.huy.model.ServiceGroup;


import java.math.BigDecimal;
import java.util.List;

public interface ServiceService {

    Page<ServiceResponse> getAllPaginated(Integer groupId, Boolean isActive,
                                          BigDecimal minPrice, BigDecimal maxPrice,
                                          Pageable pageable);
    ServiceResponse createService(ServiceCreationRequest request);

    List<ServiceGroup> getAllServiceGroups();

    ServiceGroup addServiceGroup(ServiceGroupCreationRequest request);

    ServiceResponse updateService(Long id, ServiceUpdateRequest request);

    ServiceResponse deleteService(Long id);

    void deleteServiceGroup(Long id);

}
