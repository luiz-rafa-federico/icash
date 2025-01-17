import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../../services/api";
import { userUpdateData } from "../../types/userUpdateData";
import toast from "react-hot-toast";
import axios from "axios";
import { userSignUpData } from "../../types/userSignUpData";
import { useAuth } from "../Auth";
import { useHistory } from "react-router-dom";

interface UserDataProps {
  name: string;
  email: string;
  cashback: number;
  city?: string;
  cellphone?: number;
  age?: number;
}

interface UserProviderProps {
  children: ReactNode;
}

interface UserProviderData {
  UpdateUser: (data: userUpdateData, userId: string) => void;
  user: userSignUpData;
  deleteAccount: () => void;
}

const UserContext = createContext<UserProviderData>({} as UserProviderData);

export const UserDataProvider = ({ children }: UserProviderProps) => {
  const history = useHistory();
  const token = localStorage.getItem("@iCash:token") || "";
  const [user, setUser] = useState<userSignUpData>({} as userSignUpData);
  const { login, setToken } = useAuth();

  const UpdateUser = useCallback(
    (data: userUpdateData, userId: string) => {
      axios
        .patch(`https://api-icash.herokuapp.com/users/${userId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setUser(res.data);
          toast.success("Dados atualizados com sucesso!");
        })
        .catch((err) => {
          toast.error("Oops, algo saiu mal. Tente novamente.");
        });
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      const userId = JSON.parse(localStorage.getItem("@iCash: userId") || "");
      api
        .get(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch((res) => console.log(res));
    }
  }, [token, UpdateUser, login]);

  const deleteAccount = () => {
    const userId = JSON.parse(localStorage.getItem("@iCash: userId") || "");
    api
      .delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((_) => {
        setToken("");
        localStorage.clear();
        history.push("/");
        toast.success("A sua conta foi excluída.");
      })
      .catch((err) => toast.error("Algo saiu mal. Tente novamente."));
  };

  return (
    <UserContext.Provider value={{ UpdateUser, user, deleteAccount }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUpdate = () => useContext(UserContext);
