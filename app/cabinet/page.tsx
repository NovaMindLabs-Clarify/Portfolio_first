import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/cabinet/SignInForm";
import { db } from "@/db/client";
import { objects } from "@/db/schema";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Личный кабинет",
  robots: { index: false, follow: false },
};

export default async function CabinetPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <main className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-6 py-16 text-graphite">
        <h1 className="font-display text-step-2 font-semibold">
          Вход в личный кабинет
        </h1>
        <p className="text-step-0 text-graphite/70">
          Регистрация не нужна — введите почту, мы пришлём ссылку для входа.
          Хотите сначала посмотреть, как это выглядит?{" "}
          <Link href="/demo" className="underline">
            Демо без регистрации
          </Link>
          .
        </p>
        <SignInForm />
      </main>
    );
  }

  const userObjects = await db
    .select({ id: objects.id, title: objects.title })
    .from(objects)
    .where(eq(objects.userId, session.user.id));

  if (userObjects.length === 1) {
    redirect(`/cabinet/${userObjects[0].id}`);
  }

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-6 py-16 text-graphite">
      <h1 className="font-display text-step-2 font-semibold">Ваши объекты</h1>
      {userObjects.length === 0 ? (
        <p className="text-step-0 text-graphite/70">
          Пока не привязано ни одного объекта. Загляните в{" "}
          <Link href="/demo" className="underline">
            демо-кабинет
          </Link>
          , чтобы посмотреть, как выглядит дашборд.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {userObjects.map((object) => (
            <li key={object.id}>
              <Link href={`/cabinet/${object.id}`} className="underline">
                {object.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
