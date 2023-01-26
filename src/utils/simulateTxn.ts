import axios from "axios";

export const simulateTxn = async (
  senderAddr: string,
  to: string,
  data: string,
  value: string
) => {
  const apiUrl = "http://api.tenderly.co/api/v1/account/zoronoa/project/project/simulate";
  const body = {
    "network_id": "5",
    "from": senderAddr,
    "to": to,
    "input": data,
    "gas": 0,
    "gas_price": "0",
    "value": value,
    "save_if_fails": true,
  };

  const headers = {
    headers: {
      "content-type": "application/JSON",
      "X-Access-Key": "-NfngnG0B-oaTIz2o7Lhg2Wg3AudWPtD",
    },
  };
  const resp = await axios.post(apiUrl, body, headers);
  console.log("Sinulation Response", resp.data.simulation.status);
  if (resp.data.simulation.status == false) {
    console.log("Check what went wrong : https://dashboard.tenderly.co/zoronoa/project/simulator/" + resp.data.simulation.id)
    throw new Error("Transaction is going to fail");
  }

  return;
};
