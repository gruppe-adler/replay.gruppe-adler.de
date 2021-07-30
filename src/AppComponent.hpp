#pragma once

#include "db/Database.hpp"
#include "SwaggerComponent.hpp"

#include "oatpp/web/server/HttpConnectionHandler.hpp"
#include "oatpp/web/server/HttpRouter.hpp"

#include "oatpp/network/tcp/server/ConnectionProvider.hpp"

#include "oatpp/parser/json/mapping/ObjectMapper.hpp"

#include "oatpp/core/base/CommandLineArguments.hpp"
#include "oatpp/core/macro/component.hpp"

#include <mongocxx/client.hpp>

#include "oatpp-zlib/EncoderProvider.hpp"
#include "oatpp/web/protocol/http/incoming/SimpleBodyDecoder.hpp"


class AppComponent {
private:

    const std::string DB_NAME = "replays";

    oatpp::base::CommandLineArguments cmdArgs;
public:
    AppComponent(const oatpp::base::CommandLineArguments& cmdArgs)
        : cmdArgs(cmdArgs)
    {}
public:

    SwaggerComponent swaggerComponent;

    OATPP_CREATE_COMPONENT(std::shared_ptr<oatpp::network::ServerConnectionProvider>, serverConnectionProvider)([] {
        return oatpp::network::tcp::server::ConnectionProvider::createShared({ "0.0.0.0", 8000/*, oatpp::network::Address::IP_4*/ });
    }());


    OATPP_CREATE_COMPONENT(std::shared_ptr<oatpp::web::server::HttpRouter>, httpRouter)([] {
        return oatpp::web::server::HttpRouter::createShared();
    }());


    OATPP_CREATE_COMPONENT(std::shared_ptr<oatpp::network::ConnectionHandler>, serverConnectionHandler)([] {
        OATPP_COMPONENT(std::shared_ptr<oatpp::web::server::HttpRouter>, router); // get Router component

        auto components = std::make_shared<oatpp::web::server::HttpProcessor::Components>(router);

        /* Add content encoders */
        auto encoders = std::make_shared<oatpp::web::protocol::http::encoding::ProviderCollection>();

        encoders->add(std::make_shared<oatpp::zlib::DeflateEncoderProvider>());
        encoders->add(std::make_shared<oatpp::zlib::GzipEncoderProvider>());

        /* Set content encoders */
        components->contentEncodingProviders = encoders;

        auto decoders = std::make_shared<oatpp::web::protocol::http::encoding::ProviderCollection>();

        decoders->add(std::make_shared<oatpp::zlib::DeflateDecoderProvider>());
        decoders->add(std::make_shared<oatpp::zlib::GzipDecoderProvider>());

        /* Set Body Decoder */
        components->bodyDecoder = std::make_shared<oatpp::web::protocol::http::incoming::SimpleBodyDecoder>(decoders);

        return std::make_shared<oatpp::web::server::HttpConnectionHandler>(components);

        //return oatpp::web::server::HttpConnectionHandler::createShared(router);
    }());

    OATPP_CREATE_COMPONENT(std::shared_ptr<oatpp::data::mapping::ObjectMapper>, apiObjectMapper)([] {
        auto objectMapper = oatpp::parser::json::mapping::ObjectMapper::createShared();
        objectMapper->getDeserializer()->getConfig()->allowUnknownFields = false;
        objectMapper->getSerializer()->getConfig()->useBeautifier = true;
        return objectMapper;
    }());

    OATPP_CREATE_COMPONENT(std::shared_ptr<db::Database>, database)([this] {

        oatpp::String connectionString = std::getenv("MONGO_CONN_STR");
        if (!connectionString) {
            connectionString = cmdArgs.getNamedArgumentValue("--conn-str", std::string("mongodb://localhost/").append(DB_NAME).c_str());
        }

        mongocxx::uri uri(connectionString->std_str());
        return std::make_shared<db::Database>(uri, DB_NAME, "all");

    }());

};

