
#include "controller/ReplayController.hpp"
#include "controller/StaticController.hpp"
#include "./AppComponent.hpp"

#include "oatpp-swagger/Controller.hpp"
#include "oatpp/network/Server.hpp"

#include <mongocxx/instance.hpp>

#include <iostream>

void run(const oatpp::base::CommandLineArguments& args) {

    mongocxx::instance instance{};

    AppComponent components(args);

    auto router = components.httpRouter.getObject();
    auto docEndpoints = oatpp::swagger::Controller::Endpoints::createShared();

    auto replayController = ReplayController::createShared();
    replayController->addEndpointsToRouter(router);

    docEndpoints->pushBackAll(replayController->getEndpoints());

    auto swaggerController = oatpp::swagger::Controller::createShared(docEndpoints);
    swaggerController->addEndpointsToRouter(router);

    auto staticController = StaticController::createShared();
    staticController->addEndpointsToRouter(router);

    oatpp::network::Server server(components.serverConnectionProvider.getObject(),
        components.serverConnectionHandler.getObject());

    OATPP_LOGD("Server", "Running on port %s...", components.serverConnectionProvider.getObject()->getProperty("port").toString()->c_str());

    server.run();
}

int main(int argc, const char* argv[]) {

    oatpp::base::Environment::init();

    run(oatpp::base::CommandLineArguments(argc, argv));

    /* Disable object counting for release builds using '-D OATPP_DISABLE_ENV_OBJECT_COUNTERS' flag for better performance */
    std::cout << "\nEnvironment:\n";
    std::cout << "objectsCount = " << oatpp::base::Environment::getObjectsCount() << "\n";
    std::cout << "objectsCreated = " << oatpp::base::Environment::getObjectsCreated() << "\n\n";

    oatpp::base::Environment::destroy();

    return 0;
}
