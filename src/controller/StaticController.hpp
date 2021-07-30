#pragma once

#include "oatpp/web/server/api/ApiController.hpp"
#include "oatpp/parser/json/mapping/ObjectMapper.hpp"
#include "oatpp/core/macro/codegen.hpp"
#include "oatpp/core/macro/component.hpp"

#include <fstream>
#include <filesystem>
#include <iostream>

namespace fs = std::filesystem;

#include OATPP_CODEGEN_BEGIN(ApiController) //<- Begin Codegen

class StaticController : public oatpp::web::server::api::ApiController {
public:
    StaticController(const std::shared_ptr<ObjectMapper>& objectMapper)
        : oatpp::web::server::api::ApiController(objectMapper)
    {}
public:

    static std::shared_ptr<StaticController> createShared(
        OATPP_COMPONENT(std::shared_ptr<ObjectMapper>, objectMapper)
    ) {
        return std::make_shared<StaticController>(objectMapper);
    }

    ENDPOINT("GET", "/", root) {
        const char* html =
            "<html lang='en'>"
            "  <head>"
            "    <meta charset=utf-8/>"
            "  </head>"
            "  <body>"
            "    <a href='aar'>AAR</a>"
            "    <a href='swagger/ui'>Checkout Swagger-UI page</a>"
            "  </body>"
            "</html>";
        auto response = createResponse(Status::CODE_200, html);
        response->putHeader(Header::CONTENT_TYPE, "text/html");
        return response;
    }

    oatpp::String loadFileOrGetFromCache(const oatpp::String& filepath) {

        // TODO: refactor this abomination
        auto filePath = fs::path("static");// / filepath.get()->std_str();

        std::string f = (fs::path("static") / filepath.get()->std_str()).string().c_str();

        OATPP_LOGI("Server", " Loading file from %s", f.c_str());
        std::cout << f << std::endl;

        // LRU Cache maybe?
        std::ifstream ifs(f);
        std::string str((std::istreambuf_iterator<char>(ifs)),
            std::istreambuf_iterator<char>());

        OATPP_LOGD("Server", " File content '%s'", str.c_str());

        return oatpp::String(str.c_str());
    }

    ENDPOINT("GET", "*", files, REQUEST(std::shared_ptr<IncomingRequest>, request)) {
        auto filePath = request->getPathTail();
        OATPP_ASSERT_HTTP(filePath, Status::CODE_400, "Empty filename");
        oatpp::String buffer = loadFileOrGetFromCache(filePath);
        if (buffer->getSize() == 0) {
            return createResponse(Status::CODE_404, "404 - Not found");
        }
        else {
            return createResponse(Status::CODE_200, buffer);
        }
    }

};

#include OATPP_CODEGEN_BEGIN(ApiController) //<- End Codegen

