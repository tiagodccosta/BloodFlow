import React from "react";
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";


const Footer = () => {
    return(
        <div className="bg-black mw-w-[1240px] pb-10 flex justify-center">
                <img className="w-44 pt-10" src={BloodFlowLogo} alt="/" />
        </div>
    )
}

export default Footer