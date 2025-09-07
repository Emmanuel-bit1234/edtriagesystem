import axios from "axios";

export default function PredictionAPI() {
    this.getPrediction = (data) => {
        var url = "https://1c890312931d.ngrok-free.app/model1";
        return axios.post(url, data, { withCredentials: true }).then((response) => response.data);
    };
    this.getAllPredictions = () => {
        var url = `https://1c890312931d.ngrok-free.app/get-predictions`;
        return axios.get(url).then((response) => response.data);
    };

    this.getAllPredictions1 = async () => {
        const requestOptions = {
            method: "GET",
            redirect: "follow",
        };

        const res = await fetch("https://1c890312931d.ngrok-free.app/get-predictions", requestOptions);
        return await res.json();
    };
}
