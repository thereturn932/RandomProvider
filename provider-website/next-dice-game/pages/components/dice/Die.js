import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class Die extends Component {
  render() {
    const { face, rolling } = this.props;

    // Using font awesome icon to show
    // the exactnumber of dots
    return (
      <div className="DiceAround">
        <FontAwesomeIcon
          icon={face}
          className={`Die
				${rolling && "Die-shaking"}`}
        />
      </div>
    );
  }
}

export default Die;
