#pragma once

#include "../dto/ConfigDto.hpp"
#include "../dto/FrameDto.hpp"

#include "oatpp/core/macro/codegen.hpp"
#include "oatpp/core/Types.hpp"

#include "oatpp-mongo/bson/Utils.hpp"

#include "oatpp/core/parser/Caret.hpp"
#include "oatpp/core/utils/ConversionUtils.hpp"
#include "oatpp/core/Types.hpp"

#include OATPP_CODEGEN_BEGIN(DTO)

class ReplayDb : public oatpp::DTO {

    DTO_INIT(ReplayDb, DTO)

    DTO_FIELD(oatpp::mongo::bson::ObjectId, _id);
    DTO_FIELD(String, id);
    DTO_FIELD(String, missionName);
    DTO_FIELD(String, date);
    DTO_FIELD(Int32, duration);
    DTO_FIELD(String, worldName);
    DTO_FIELD(String, frameCount);
    DTO_FIELD(List<Object<FrameDto>>, data);
    DTO_FIELD(Object<ConfigDto>, config);
};

#include OATPP_CODEGEN_END(DTO)

