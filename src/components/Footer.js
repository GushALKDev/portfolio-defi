import React from "react";
import linkedin_logo from "../img/linkedin.png";

const MyFooter = () => (
  <div className="footer">
    © 2022 Copyright:&nbsp;
    <a href="https://www.gustavomartinalonso.com">
      www.gustavomartinalonso.com
    </a>
    &nbsp;&nbsp;
    <a href="https://www.linkedin.com/in/gustavomaral/" target="_blank">
      <img src={linkedin_logo} width="35" height="37"></img>
    </a>
  </div>
);

export default MyFooter;
