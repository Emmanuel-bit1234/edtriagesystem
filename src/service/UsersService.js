
export default function UsersService() {
    this.createUser = (data) => {
        var url = `${MICRO_SERVICE_IP}/api/auth/signin`;
        return axios.post(url, data).then(response => response.data)
    }

   
}
