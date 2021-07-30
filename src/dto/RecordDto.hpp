#pragma once

#include "oatpp/core/macro/codegen.hpp"
#include "oatpp/core/Types.hpp"

#include OATPP_CODEGEN_BEGIN(DTO)

class RecordDto : public oatpp::DTO {

    DTO_INIT(RecordDto, DTO)

        DTO_FIELD(String, time, "time");
    DTO_FIELD(List<Float32>, color, "color");
    DTO_FIELD(Float32, direction, "direction");
    DTO_FIELD(String, group, "group");
    DTO_FIELD(String, icon, "icon");
    DTO_FIELD(String, name, "name");
    DTO_FIELD(List<Float32>, position, "position");
    DTO_FIELD(List<Float32>, target, "target");

};

#include OATPP_CODEGEN_END(DTO)

