import axios from "axios";

class AuthenticationService {
    signin = (username, password) => {

        return axios
            .post("http://20.87.43.104:8084/api/auth/signin", { username, password })
            .then((response) => {
                if (response.data.accessToken) {
                    localStorage.setItem(
                        "registration_centre",
                        JSON.stringify({
                            id: 34,
                            name: "Makeng Primary School",
                        })
                    );
                    localStorage.setItem("isAuthenticated", true);
                    localStorage.setItem("user", JSON.stringify(response.data));
                }
                return response.data;
            })
            .catch((err) => {
                console.log(err);
                throw err;
            });
    };

    signOut() {
        localStorage.clear();
    }

    register = async (firstname, lastname, username, email, password) => {
        return axios.post("http://20.87.43.104:8084/api/auth/signup", {
            firstname,
            lastname,
            username,
            email,
            password,
        });
    };

    getCurrentUser() {
        return JSON.parse(localStorage.getItem("user"));
    }

    getCurrentRegCentre() {
        return JSON.parse(localStorage.getItem("registration_centre"));
    }
    updateCurrentRegCentre(id, name) {
        localStorage.setItem(
            "registration_centre",
            JSON.stringify({
                id: id,
                name: name,
            })
        );
    }
}

export default new AuthenticationService();
