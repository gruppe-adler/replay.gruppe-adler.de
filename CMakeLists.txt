cmake_minimum_required(VERSION 3.1)

option(USE_STATIC_LINKING "Static Linking" OFF)

project(replay-service)

set(CMAKE_CXX_STANDARD 20)

add_definitions(-DSTATIC_DIR="${PROJECT_SOURCE_DIR}")

add_library(${CMAKE_PROJECT_NAME}-lib
    src/db/Database.cpp
    src/db/Database.hpp
    src/AppComponent.hpp
    src/SwaggerComponent.hpp
    
    
     
    src/dto/ConfigDto.hpp
    src/dto/FrameDto.hpp 
    src/dto/RecordDto.hpp
    src/dto/ReplayDto.hpp
    src/controller/ReplayController.hpp
    src/controller/StaticController.hpp
)

if(MSVC)
    if(USE_STATIC_LINKING)
        if(${CMAKE_BUILD_TYPE} STREQUAL "Debug")
            target_compile_options(${CMAKE_PROJECT_NAME}-lib PUBLIC "/MTd")
        else()
            target_compile_options(${CMAKE_PROJECT_NAME}-lib PUBLIC "/MT")
        endif()
    else()
        if(${CMAKE_BUILD_TYPE} STREQUAL "Debug")
            target_compile_options(${CMAKE_PROJECT_NAME}-lib PUBLIC "/MDd")
        else()
            target_compile_options(${CMAKE_PROJECT_NAME}-lib PUBLIC "/MD")
        endif()
    endif()

elseif(USE_STATIC_LINKING)
    set(CMAKE_FIND_LIBRARY_SUFFIXES ".a")
    set(BUILD_SHARED_LIBS OFF)
    #set(CMAKE_EXE_LINKER_FLAGS "-static")
endif()

# Find mongocxx
find_package(libmongocxx REQUIRED)

message("LIBBSONCXX_INCLUDE_DIRS=${LIBBSONCXX_INCLUDE_DIRS}")
message("LIBBSONCXX_LIBRARIES=${LIBBSONCXX_LIBRARIES}")

message("LIBMONGOCXX_INCLUDE_DIRS=${LIBMONGOCXX_INCLUDE_DIRS}")
message("LIBMONGOCXX_LIBRARIES=${LIBMONGOCXX_LIBRARIES}")

find_package(ZLIB)

# FInd oatpp
find_package(oatpp          1.2.5 REQUIRED)
find_package(oatpp-swagger  1.2.5 REQUIRED)
find_package(oatpp-mongo    1.2.5 REQUIRED)
find_package(oatpp-zlib     1.2.5 REQUIRED)

if(USE_STATIC_LINKING)
    find_package (libmongoc-1.0 REQUIRED)
endif()

## include directories

target_include_directories(${CMAKE_PROJECT_NAME}-lib PUBLIC src)
include_directories(${CMAKE_PROJECT_NAME}-lib PUBLIC ${LIBMONGOCXX_INCLUDE_DIRS})

## Link libs
target_link_libraries(${CMAKE_PROJECT_NAME}-lib
    PUBLIC oatpp::oatpp
    PUBLIC oatpp::oatpp-swagger
    PUBLIC oatpp::oatpp-mongo
    PUBLIC oatpp::oatpp-zlib
    PUBLIC ZLIB::ZLIB
)

target_link_libraries(${CMAKE_PROJECT_NAME}-lib PUBLIC ${LIBMONGOCXX_LIBRARIES})

if(USE_STATIC_LINKING)
    target_link_libraries (${CMAKE_PROJECT_NAME}-lib PUBLIC ${MONGOC_LIBRARIES})
endif()

#if (TARGET mongo::mongocxx_shared)
#    target_link_libraries(${project_name}-lib
#            PUBLIC mongo::mongocxx_shared
#    )
#    message("mongo::mongocxx_shared is used")
#elseif(TARGET mongo::mongocxx_static)
#    target_link_libraries(${project_name}-lib
#            PUBLIC mongo::mongocxx_static
#    )
#endif()

## define path to swagger-ui res folder
add_definitions(-DOATPP_SWAGGER_RES_PATH="${oatpp-swagger_INCLUDE_DIRS}/../bin/oatpp-swagger/res")

#################################################################
## add executables

add_executable(${CMAKE_PROJECT_NAME}
    src/App.cpp
    src/dto/ConfigDto.hpp
    src/dto/FrameDto.hpp
    src/dto/RecordDto.hpp
    src/dto/ReplayDto.hpp
    src/controller/ReplayController.hpp
    src/controller/StaticController.hpp
)

if(MSVC)
    if(USE_STATIC_LINKING)
        if(${CMAKE_BUILD_TYPE} STREQUAL "Debug")
            target_compile_options(${CMAKE_PROJECT_NAME} PUBLIC "/MTd")
        else()
            target_compile_options(${CMAKE_PROJECT_NAME} PUBLIC "/MT")
        endif()
    else()
        if(${CMAKE_BUILD_TYPE} STREQUAL "Debug")
            target_compile_options(${CMAKE_PROJECT_NAME} PUBLIC "/MDd")
        else()
            target_compile_options(${CMAKE_PROJECT_NAME} PUBLIC "/MD")
        endif()
    endif()
endif()


target_link_libraries(${CMAKE_PROJECT_NAME} ${CMAKE_PROJECT_NAME}-lib)
add_dependencies(${CMAKE_PROJECT_NAME} ${CMAKE_PROJECT_NAME}-lib)

file(COPY "${oatpp-swagger_INCLUDE_DIRS}/../bin/oatpp-swagger/res" DESTINATION ${CMAKE_BINARY_DIR})
file(COPY "./static" DESTINATION ${CMAKE_BINARY_DIR})

install(TARGETS ${CMAKE_PROJECT_NAME}
        RUNTIME DESTINATION service
)

install(DIRECTORY "${oatpp-swagger_INCLUDE_DIRS}../bin/oatpp-swagger/res" DESTINATION service)
install(DIRECTORY "./static" DESTINATION service)
