#pragma once

#include "db/Database.hpp"
#include "dto/ReplayDto.hpp"

#include "oatpp-swagger/Types.hpp"

#include "oatpp/web/server/api/ApiController.hpp"
#include "oatpp/parser/json/mapping/ObjectMapper.hpp"

#include "oatpp/core/data/stream/BufferStream.hpp"

#include "oatpp/core/macro/codegen.hpp"
#include "oatpp/core/macro/component.hpp"

using namespace oatpp::web::server::handler;

#include OATPP_CODEGEN_BEGIN(ApiController)

class ReplayController : public oatpp::web::server::api::ApiController {
private:
    OATPP_COMPONENT(std::shared_ptr<db::Database>, database);

    oatpp::String bearerToken;

public:
    ReplayController(const std::shared_ptr<ObjectMapper>& objectMapper)
        : oatpp::web::server::api::ApiController(objectMapper)
    {
#if _DEBUG
        bearerToken = "MEH";
#else
        bearerToken = std::getenv("AUTH_TOKEN");
#endif
        setDefaultAuthorizationHandler(std::make_shared<BearerAuthorizationHandler>("grad.replay.service"));
    }
public:

    static std::shared_ptr<ReplayController> createShared(
        OATPP_COMPONENT(std::shared_ptr<ObjectMapper>, objectMapper))
    {
        return std::make_shared<ReplayController>(objectMapper);
    }

    ENDPOINT_INFO(createReplay) {
        info->summary = "Create new replay";
        info->addConsumes<Object<ReplayDto>>("application/json");
        info->addResponse<Object<ReplayDto>>(Status::CODE_200, "application/json");
        info->addSecurityRequirement("bearer_auth");
    }
    ENDPOINT("POST", "api/replays", createReplay,
        BODY_DTO(Object<ReplayDto>, replayDto),
        AUTHORIZATION(std::shared_ptr<DefaultBearerAuthorizationObject>, authObject)) {
        OATPP_ASSERT_HTTP(authObject->token == bearerToken, Status::CODE_401, "Unauthorized");
        auto replayDb = database->createReplay(replayDto);
        auto response = createDtoResponse(Status::CODE_201, replayDb);
        response->putHeader("Location", "api/replays/" + replayDb->id);
        return response;
    }

    ENDPOINT_INFO(getReplay) {
        info->summary = "Get one replay by replay id";
        info->addResponse<Object<ReplayDto>>(Status::CODE_200, "application/json");
        info->addResponse<String>(Status::CODE_404, "text/plain");
        // params
        info->pathParams["replayid"].description = "replays/replayid";
    }
    ENDPOINT("GET", "api/replays/{replayid}", getReplay,
        PATH(String, replayid)) {
        auto replay = database->getReplay(replayid);
        OATPP_ASSERT_HTTP(replay, Status::CODE_404, "Replay not found");
        return createDtoResponse(Status::CODE_200, replay->data);
    }

    ENDPOINT_INFO(getReplayDataElement) {
        info->summary = "Get one replay by replay id";
        info->addResponse<Object<ReplayDto>>(Status::CODE_200, "application/json");
        info->addResponse<String>(Status::CODE_404, "text/plain");
        // params
        info->pathParams["replayid"].description = "replays/replayid";
        info->pathParams["index"].description = "replays/index";
    }
    ENDPOINT("GET", "api/replays/{replayid}/data/{index}", getReplayDataElement,
        PATH(String, replayid), PATH(UInt32, index)) {
        auto replay = database->getReplayDataElement(replayid, index);
        OATPP_ASSERT_HTTP(replay, Status::CODE_404, "Replay not found");
        return createDtoResponse(Status::CODE_200, replay->data);
    }


    ENDPOINT_INFO(getReplayDataElementRange) {
        info->summary = "Get one replay by replay id";
        info->addResponse<Object<ReplayDto>>(Status::CODE_200, "application/json");
        info->addResponse<String>(Status::CODE_404, "text/plain");
        // params
        info->pathParams["replayid"].description = "replays/replayid";
        info->pathParams["index"].description = "replays/index";
        info->pathParams["amount"].description = "replays/amount";
    }
    ENDPOINT("GET", "api/replays/{replayid}/data/{index}/{amount}", getReplayDataElementRange,
        PATH(String, replayid), PATH(UInt32, index), PATH(UInt32, amount)) {
        auto replay = database->getReplayDataElement(replayid, index, amount);
        OATPP_ASSERT_HTTP(replay, Status::CODE_404, "Replay not found");
        return createDtoResponse(Status::CODE_200, replay->data);
    }


    ENDPOINT_INFO(getAllReplays) {
        info->summary = "get all stored replays";
        info->addResponse<List<Object<ReplayDto>>>(Status::CODE_200, "application/json");
    }
    ENDPOINT("GET", "api/replays", getAllReplays) {
        return createDtoResponse(Status::CODE_200, database->getAllReplays());
    }


    ENDPOINT_INFO(deleteReplay) {
        // general
        info->summary = "Delete Replay by id";
        info->addResponse<String>(Status::CODE_200, "text/plain");
        info->addResponse<String>(Status::CODE_404, "text/plain");
        // params specific
        info->pathParams["replayid"].description = "replayid";
        info->addSecurityRequirement("bearer_auth");
    }
    ENDPOINT("DELETE", "api/replays/{replayid}", deleteReplay,
        PATH(String, replayid),
        AUTHORIZATION(std::shared_ptr<DefaultBearerAuthorizationObject>, authObject)) {
        OATPP_ASSERT_HTTP(authObject->token == bearerToken, Status::CODE_401, "Unauthorized");
        bool success = database->deleteReplay(replayid);
        OATPP_ASSERT_HTTP(success, Status::CODE_500, "Replay not deleted.");
        return createResponse(Status::CODE_200, "Replay successfully deleted");
    }

};

#include OATPP_CODEGEN_END(ApiController)

