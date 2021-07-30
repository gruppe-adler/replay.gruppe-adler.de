#pragma once

#include "oatpp-swagger/Model.hpp"
#include "oatpp-swagger/Resources.hpp"
#include "oatpp/core/macro/component.hpp"

#include <filesystem>

namespace fs = std::filesystem;

class SwaggerComponent {
public:

    OATPP_CREATE_COMPONENT(std::shared_ptr<oatpp::swagger::DocumentInfo>, swaggerDocumentInfo)([] {

        oatpp::swagger::DocumentInfo::Builder builder;

        builder
            .setTitle("Replay API of Gruppe Adler.")
            .setDescription("Replay API of Gruppe Adler. It holds and therefore also serves all replay data (actual data where which unit was etc.).")
            .setVersion("0.1")
            .setContactName("Gruppe Adler")
            .setContactUrl("https://gruppe-adler.de/kontakt")

            .addServer("http://localhost:8000", "server on localhost")

            .addSecurityScheme("bearer_auth", oatpp::swagger::DocumentInfo::SecuritySchemeBuilder::DefaultBearerAuthorizationSecurityScheme());

        return builder.build();

        }());

    OATPP_CREATE_COMPONENT(std::shared_ptr<oatpp::swagger::Resources>, swaggerResources)([] {
        return oatpp::swagger::Resources::loadResources("res");
    }());

};

