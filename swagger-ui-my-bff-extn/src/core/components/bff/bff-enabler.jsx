import React from "react";
import PropTypes from "prop-types";

export default class BffEnabler extends React.Component {
  static propTypes = {
    specActions: PropTypes.object.isRequired,
    specSelectors: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
    authSelectors: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    getSystem: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    const system = props.getSystem();
    

  }

  componentDidMount() {
    const system = this.props.getSystem();
    const { authSelectors } = this.props;

    const authorizableDefinitions = authSelectors.definitionsToAuthorize();
    const bffChecks = [];

    for (const defMap of authorizableDefinitions) {
      const defPlain = defMap.toJS();

      for (const key of Object.keys(defPlain)) {
        const def = defPlain[key];
        const scheme = def["scheme"];
        const type = def["type"];

        if (scheme === "bff" && type === "http") {
         

          const profileUrl = def["profilecheck"];
          if (profileUrl) {
            // fetch login status
            const check = fetch(profileUrl, { credentials: "include", cache: "no-store" })
              .then((resp) => {
                if (!resp.ok){
					throw new Error("Network response was not ok");
				} 
				const respJson=resp.json();
				
                return respJson;
              })
              .then((json) => {
                const loggedIn = !!json?.loggedIn;
                // no else needed: full-page app, Redux state is blank on every load — nothing stale to clear
                if (loggedIn) {
                  
				  const authObj = {
				    [key]: {
				      name: key,
				      schema: def,   // IMPORTANT
				      value: json
				    }
				  };
				 // this.props.authActions.logout({ [key]: {} });
				   this.props.authActions.authorize(authObj);
                }
              })
              .catch((err) => {
                def.loggedErr = err;
                console.error("BFF login check error:", err);
              });

            bffChecks.push(check);
          }
        }
      }
    }

   
      
  }

  render() {
    // This component itself does not render visible UI
    return <div style={{ display: "none" }} />;
  }
}
