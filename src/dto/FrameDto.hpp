#pragma once

#include "RecordDto.hpp"

#include "oatpp/core/macro/codegen.hpp"
#include "oatpp/core/Types.hpp"

#include OATPP_CODEGEN_BEGIN(DTO)

class FrameDto : public oatpp::DTO {

    DTO_INIT(FrameDto, DTO)

        DTO_FIELD(String, time, "time");
    DTO_FIELD(List<Object<RecordDto>>, data, "data");

};

#include OATPP_CODEGEN_END(DTO)

