const Subscription = (props) => {
  let subs = [];
  let isDel = [];
  try {
    if (props.subs.length !== 0) {
      console.log("Really");
      subs = props.subs[0];
      isDel = props.subs[1];
    }
  } catch {
    console.log("No subs");
  }
  return (
    <div className="subscriptions">
      <div className="sub-title">
        <h1>My Subscriptions</h1>
        <div className="list-div">
          <ul className="list">
            {subs.length !== 0 ? (
              subs.map((sub) => (
                <li className="list-item" key={sub}>
                  {console.log("Sub is", sub)}
                  <p>Subscription {sub.toNumber()}</p>
                  <button
                    onClick={() => {
                      props.changeCurrentSub(sub.toNumber());
                    }}
                  >
                    Manage
                  </button>
                </li>
              ))
            ) : (
              <>
                <p>You do not have any subscriptipn</p>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
