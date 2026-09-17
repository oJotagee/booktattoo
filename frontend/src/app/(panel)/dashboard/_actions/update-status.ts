"use server"

import { revalidatePath } from "next/cache"
import { isAxiosError } from "axios"

import { userServiceApi } from "@/lib/user-service-api"
import { auth } from "@/lib/auth"

export type UserStatus = "ACTIVE" | "INACTIVE" | "VACATION"

export async function updateUserStatus(status: UserStatus) {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Usuário não autenticado")

  try {
    await userServiceApi.patch(
      "/users/me/status",
      { status },
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error === "UserAlreadyInStatusError") {
      return { status }
    }

    throw error;
  }

  revalidatePath("/dashboard/", "layout")

  return { status }
}
