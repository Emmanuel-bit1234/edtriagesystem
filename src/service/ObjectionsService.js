import axios from "axios";
import { NET_IP } from "../config/Config";

export default function ObjectionsService() {
    this.getAllObjections = () => {
        var url = `${NET_IP}/DataInspection/GetObjections?regNo=131313`;
        return axios.get(url).then((response) => response.data.Objections);
    };
}
