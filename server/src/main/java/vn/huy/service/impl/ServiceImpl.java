package vn.huy.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.huy.controller.request.ServiceCreationRequest;
import vn.huy.controller.request.ServiceGroupCreationRequest;
import vn.huy.controller.request.ServiceUpdateRequest;
import vn.huy.controller.response.ServiceResponse;
import vn.huy.exception.InvalidDataException;
import vn.huy.exception.ResourceNotFoundException;
import vn.huy.model.ServiceEntity;
import vn.huy.model.ServiceGroup;
import vn.huy.repository.ServiceGroupRepository;
import vn.huy.repository.ServiceRepository;
import vn.huy.service.ServiceService;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;
    private final ServiceGroupRepository serviceGroupRepository;

    @Override
    public Page<ServiceResponse> getAllPaginated(Integer groupId, Boolean isActive,
                                                 BigDecimal minPrice, BigDecimal maxPrice,
                                                 Pageable pageable) {
        log.info("Getting services with pagination - page: {}", pageable.getPageNumber());
        Page<ServiceEntity> page = serviceRepository.findByFilter(groupId, isActive, minPrice, maxPrice, pageable);
        return page.map(this::mapToResponse);
    }

    // Trong ServiceServiceImpl.java
@Override
@Transactional
public ServiceResponse createService(ServiceCreationRequest request) {

    Long finalGroupId = (request.getGroupId() != null) ? Long.valueOf(request.getGroupId()) : 1L;

    if (serviceRepository.existsByNameAndServiceGroup_Id(request.getName(), finalGroupId)) {
        throw new InvalidDataException("Service already exists in this group");
    }

    ServiceGroup serviceGroup = serviceGroupRepository.findById(finalGroupId)
            .orElseThrow(() -> new ResourceNotFoundException("Service Group not found"));

    ServiceEntity serviceEntity = new ServiceEntity();
    serviceEntity.setName(request.getName());
    serviceEntity.setServiceGroup(serviceGroup); 
    serviceEntity.setUnitPrice(request.getUnitPrice());
    serviceEntity.setActive(request.getIsActive() != null ? request.getIsActive() : true);
    serviceEntity.setDescription(request.getDescription());

    serviceRepository.save(serviceEntity);

    return mapToResponse(serviceEntity);
}

    @Override
    public List<ServiceGroup> getAllServiceGroups() {
        return serviceGroupRepository.findAll();
    }

    @Override
    public ServiceGroup addServiceGroup(ServiceGroupCreationRequest request) {
        ServiceGroup serviceGroup = new ServiceGroup();
        serviceGroup.setName(request.getName());
        serviceGroupRepository.save(serviceGroup);
        return serviceGroup;
    }

    @Override
    @Transactional
    public ServiceResponse updateService(Long id, ServiceUpdateRequest request) {
        log.info("serviceInterface.update()");
        ServiceEntity entity = getService(id);

        if (request.getName() != null && request.getGroupId() != null) {
            
            if (serviceRepository.existsByNameAndServiceGroup_Id(request.getName(), request.getGroupId().longValue()) &&
                    (!request.getName().equals(entity.getName()) || !request.getGroupId().equals(entity.getServiceGroup().getId().intValue()))) {
                throw new InvalidDataException("Service name already exists in this group");
            }
        }

        if (request.getName() != null) entity.setName(request.getName());
    
        if (request.getGroupId() != null) entity.setServiceGroup(getServiceGroup(request.getGroupId().longValue()));
        
        if (request.getUnitPrice() != null) entity.setUnitPrice(request.getUnitPrice());
        if (request.getIsActive() != null) entity.setActive(request.getIsActive());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());

        serviceRepository.save(entity);

        return mapToResponse(entity);
    }

    @Override
    @Transactional
    public ServiceResponse deleteService(Long id) {
        ServiceEntity serviceEntity = getService(id);
        // Logic xóa mềm hoặc xóa cứng tùy bạn, ở đây giữ nguyên logic cũ
        serviceEntity.setActive(false);
        serviceRepository.save(serviceEntity);
        return mapToResponse(serviceEntity);
    }

    @Override
    @Transactional
    public void deleteServiceGroup(Long id) {
        ServiceGroup group = getServiceGroup(id);

        
        boolean hasServices = serviceRepository.existsByServiceGroup_Id(id);
        if (hasServices) {
            throw new InvalidDataException("Cannot delete group because there is still a linked service");
        }

        serviceGroupRepository.delete(group);
    }

    private ServiceEntity getService(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
    }

    private ServiceGroup getServiceGroup(Long id) {
        return serviceGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service group not found"));

    }

    private ServiceResponse mapToResponse(ServiceEntity entity) {
        return ServiceResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .groupId(entity.getServiceGroup().getId()) 
                .unitPrice(entity.getUnitPrice())
                .isActive(entity.isActive())
                .description(entity.getDescription())
                .build();
    }
}