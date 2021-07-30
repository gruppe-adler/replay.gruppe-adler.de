#pragma once

#include "oatpp/core/macro/codegen.hpp"
#include "oatpp/core/Types.hpp"

#include OATPP_CODEGEN_BEGIN(DTO)

class ConfigDto : public oatpp::DTO {

    DTO_INIT(ConfigDto, DTO)

        DTO_FIELD(Int32, precision);
    DTO_FIELD(Int32, sendingChunkSize);
    DTO_FIELD(Int32, stepsPerTick);
    DTO_FIELD(Boolean, trackShots);
    DTO_FIELD(Boolean, trackedAI);
    DTO_FIELD(List<String>, trackedSides);
    DTO_FIELD(Boolean, trackedVehicles);

};

#include OATPP_CODEGEN_END(DTO)

