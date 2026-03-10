if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/mohdrahmankhan/.gradle/caches/8.14.1/transforms/86065fa9e2e3346b38f48dac5c9f9476/transformed/jetified-hermes-android-0.80.2-release/prefab/modules/libhermes/libs/android.x86/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/mohdrahmankhan/.gradle/caches/8.14.1/transforms/86065fa9e2e3346b38f48dac5c9f9476/transformed/jetified-hermes-android-0.80.2-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

