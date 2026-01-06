import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { InputLabel, InputType } from "@mini/forms";

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export class PostFormSchema {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  @InputLabel("Título")
  @InputType("text")
  title = "";

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  @InputLabel("Conteúdo")
  @InputType("textarea")
  body = "";
}
