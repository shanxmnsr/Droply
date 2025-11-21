declare module "imagekitio-react" {
  import * as React from "react";

  // IKContext
  interface IKContextProps {
    publicKey: string;
    urlEndpoint: string;
    authenticationEndpoint?: string;
    children?: React.ReactNode;
  }

  export class IKContext extends React.Component<IKContextProps> {}

  // IKImage 
  interface Lqip {
    active?: boolean;
    quality?: number;
    blur?: number;
  }

  interface IKImageProps
    extends React.ImgHTMLAttributes<HTMLImageElement> {
    urlEndpoint: string;
    path: string;
    transformation?: Array<{ [key: string]: any }>;
    loading?: "lazy" | "eager";
    lqip?: Lqip;
  }

  export class IKImage extends React.Component<IKImageProps> {}
}
