import React from "react";
import WrapperContainer from "../../utils/WrapperContainer";
import ImagePath from "../../utils/ImagePath";
import CustomHeader from "../../components/CustomHeader";

const Cart = () => {
  const userData = {
    name: "Ashish Ranjan",
    userProfileImage: ImagePath.userProfile,
  };
  return (
    <WrapperContainer>
      <CustomHeader data={userData} />
    </WrapperContainer>
  );
};

export default Cart;

