import axios from "axios";

export default function PredictionAPI() {
    this.getPrediction = (data) => {
        var url = ` https://1c890312931d.ngrok-free.app/model1`;
        return axios.post(url, data).then((response) => response.data);
    };
}
