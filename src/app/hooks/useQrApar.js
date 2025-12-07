import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchQrAparById, fetchAllQrApar, postQrApar } from "../service/qrApar.service";

export const useQrAparById = (id) =>
  useQuery({
    queryKey: ["qrApar", id],
    queryFn: () => fetchQrAparById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, 
  });

export const useAllQrApar = () =>
  useQuery({
    queryKey: ["qrApar"],
    queryFn: fetchAllQrApar,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateQrApar = () =>
  useMutation({
    mutationFn: postQrApar,
  });
