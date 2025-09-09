import axios from "axios";

export default function PredictionAPI() {
    this.getPrediction = (data) => {
        var url = "https://triagecdssproxy.vercel.app/predict";
        return axios.post(url, data, {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiZW1tZWNoY29vbEBnbWFpbC5jb20iLCJpYXQiOjE3NTc0MjE5MzksImV4cCI6MTc1ODAyNjczOX0.vILxJe5W-587OWWKFh3RkGVQrs866v6Yci-4ICFcaGk'
            }
        }).then((response) => response.data);
    };
    this.getAllPredictions = () => {
        var url = `https://triagecdssproxy.vercel.app/prediction-logs`;
        return axios.get(url, {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiZW1tZWNoY29vbEBnbWFpbC5jb20iLCJpYXQiOjE3NTc0MjE5MzksImV4cCI6MTc1ODAyNjczOX0.vILxJe5W-587OWWKFh3RkGVQrs866v6Yci-4ICFcaGk'
            }
        }).then((response) => response.data);
    };
}
