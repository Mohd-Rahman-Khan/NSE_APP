if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/mohdrahmankhan/.gradle/caches/8.14.1/transforms/165e6302cea4f351996fb8cb544d8d26/transformed/jetified-hermes-android-0.80.2-debug/prefab/modules/libhermes/libs/android.x86/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/mohdrahmankhan/.gradle/caches/8.14.1/transforms/165e6302cea4f351996fb8cb544d8d26/transformed/jetified-hermes-android-0.80.2-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

