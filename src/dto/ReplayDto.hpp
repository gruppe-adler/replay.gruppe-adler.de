#pragma once

#include "ConfigDto.hpp"
#include "FrameDto.hpp"

#include "oatpp/core/macro/codegen.hpp"
#include "oatpp/core/Types.hpp"

#include <oatpp-mongo/bson/type/ObjectId.hpp>
#include <oatpp-mongo/bson/Types.hpp>

#include OATPP_CODEGEN_BEGIN(DTO)

class ReplayDto : public oatpp::DTO {

    DTO_INIT(ReplayDto, DTO)

        DTO_FIELD(String, id, "id");

    DTO_FIELD_INFO(missionName) {
        info->description = "mission name";
    }
    DTO_FIELD(String, missionName, "missionName");
    DTO_FIELD(String, date, "date");
    DTO_FIELD(Int32, duration, "duration");
    DTO_FIELD(String, worldName, "worldName");
    DTO_FIELD(String, frameCount, "frameCount");
    DTO_FIELD(List<Object<FrameDto>>, data, "data");
    DTO_FIELD(Object<ConfigDto>, config, "config");

};

#include OATPP_CODEGEN_END(DTO)


