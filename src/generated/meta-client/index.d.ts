
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>
/**
 * Model SuperAdmin
 * 
 */
export type SuperAdmin = $Result.DefaultSelection<Prisma.$SuperAdminPayload>
/**
 * Model EventoTenant
 * 
 */
export type EventoTenant = $Result.DefaultSelection<Prisma.$EventoTenantPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const TipoEntidad: {
  PERSONERIA: 'PERSONERIA',
  CONTRALORIA: 'CONTRALORIA',
  ALCALDIA: 'ALCALDIA',
  CONCEJO: 'CONCEJO',
  GOBERNACION: 'GOBERNACION',
  ASAMBLEA: 'ASAMBLEA',
  OTRO: 'OTRO'
};

export type TipoEntidad = (typeof TipoEntidad)[keyof typeof TipoEntidad]


export const PlanTenant: {
  BASICO: 'BASICO',
  ESTANDAR: 'ESTANDAR',
  PROFESIONAL: 'PROFESIONAL',
  ENTERPRISE: 'ENTERPRISE'
};

export type PlanTenant = (typeof PlanTenant)[keyof typeof PlanTenant]

}

export type TipoEntidad = $Enums.TipoEntidad

export const TipoEntidad: typeof $Enums.TipoEntidad

export type PlanTenant = $Enums.PlanTenant

export const PlanTenant: typeof $Enums.PlanTenant

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tenants
 * const tenants = await prisma.tenant.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Tenants
   * const tenants = await prisma.tenant.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.superAdmin`: Exposes CRUD operations for the **SuperAdmin** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SuperAdmins
    * const superAdmins = await prisma.superAdmin.findMany()
    * ```
    */
  get superAdmin(): Prisma.SuperAdminDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.eventoTenant`: Exposes CRUD operations for the **EventoTenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EventoTenants
    * const eventoTenants = await prisma.eventoTenant.findMany()
    * ```
    */
  get eventoTenant(): Prisma.EventoTenantDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.2.0
   * Query Engine version: 0c8ef2ce45c83248ab3df073180d5eda9e8be7a3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Tenant: 'Tenant',
    SuperAdmin: 'SuperAdmin',
    EventoTenant: 'EventoTenant'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "tenant" | "superAdmin" | "eventoTenant"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
          }
        }
      }
      SuperAdmin: {
        payload: Prisma.$SuperAdminPayload<ExtArgs>
        fields: Prisma.SuperAdminFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SuperAdminFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SuperAdminFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          findFirst: {
            args: Prisma.SuperAdminFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SuperAdminFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          findMany: {
            args: Prisma.SuperAdminFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>[]
          }
          create: {
            args: Prisma.SuperAdminCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          createMany: {
            args: Prisma.SuperAdminCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SuperAdminCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>[]
          }
          delete: {
            args: Prisma.SuperAdminDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          update: {
            args: Prisma.SuperAdminUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          deleteMany: {
            args: Prisma.SuperAdminDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SuperAdminUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SuperAdminUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>[]
          }
          upsert: {
            args: Prisma.SuperAdminUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          aggregate: {
            args: Prisma.SuperAdminAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSuperAdmin>
          }
          groupBy: {
            args: Prisma.SuperAdminGroupByArgs<ExtArgs>
            result: $Utils.Optional<SuperAdminGroupByOutputType>[]
          }
          count: {
            args: Prisma.SuperAdminCountArgs<ExtArgs>
            result: $Utils.Optional<SuperAdminCountAggregateOutputType> | number
          }
        }
      }
      EventoTenant: {
        payload: Prisma.$EventoTenantPayload<ExtArgs>
        fields: Prisma.EventoTenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EventoTenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventoTenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EventoTenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventoTenantPayload>
          }
          findFirst: {
            args: Prisma.EventoTenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventoTenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EventoTenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventoTenantPayload>
          }
          findMany: {
            args: Prisma.EventoTenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventoTenantPayload>[]
          }
          create: {
            args: Prisma.EventoTenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventoTenantPayload>
          }
          createMany: {
            args: Prisma.EventoTenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EventoTenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventoTenantPayload>[]
          }
          delete: {
            args: Prisma.EventoTenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventoTenantPayload>
          }
          update: {
            args: Prisma.EventoTenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventoTenantPayload>
          }
          deleteMany: {
            args: Prisma.EventoTenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EventoTenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EventoTenantUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventoTenantPayload>[]
          }
          upsert: {
            args: Prisma.EventoTenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventoTenantPayload>
          }
          aggregate: {
            args: Prisma.EventoTenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEventoTenant>
          }
          groupBy: {
            args: Prisma.EventoTenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<EventoTenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.EventoTenantCountArgs<ExtArgs>
            result: $Utils.Optional<EventoTenantCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    tenant?: TenantOmit
    superAdmin?: SuperAdminOmit
    eventoTenant?: EventoTenantOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TenantCountOutputType
   */

  export type TenantCountOutputType = {
    eventos: number
  }

  export type TenantCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    eventos?: boolean | TenantCountOutputTypeCountEventosArgs
  }

  // Custom InputTypes
  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCountOutputType
     */
    select?: TenantCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountEventosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EventoTenantWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantMinAggregateOutputType = {
    id: string | null
    slug: string | null
    codigo: string | null
    nombre: string | null
    nombreCorto: string | null
    tipoEntidad: $Enums.TipoEntidad | null
    nit: string | null
    municipio: string | null
    departamento: string | null
    codigoDivipola: string | null
    dominioPrincipal: string | null
    dominioPersonalizado: string | null
    databaseUrl: string | null
    databaseName: string | null
    plan: $Enums.PlanTenant | null
    activo: boolean | null
    suspendido: boolean | null
    motivoSuspension: string | null
    fechaActivacion: Date | null
    fechaVencimiento: Date | null
    emailContacto: string | null
    telefonoContacto: string | null
    nombreContacto: string | null
    logoUrl: string | null
    colorPrimario: string | null
    colorSecundario: string | null
    creadoPor: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantMaxAggregateOutputType = {
    id: string | null
    slug: string | null
    codigo: string | null
    nombre: string | null
    nombreCorto: string | null
    tipoEntidad: $Enums.TipoEntidad | null
    nit: string | null
    municipio: string | null
    departamento: string | null
    codigoDivipola: string | null
    dominioPrincipal: string | null
    dominioPersonalizado: string | null
    databaseUrl: string | null
    databaseName: string | null
    plan: $Enums.PlanTenant | null
    activo: boolean | null
    suspendido: boolean | null
    motivoSuspension: string | null
    fechaActivacion: Date | null
    fechaVencimiento: Date | null
    emailContacto: string | null
    telefonoContacto: string | null
    nombreContacto: string | null
    logoUrl: string | null
    colorPrimario: string | null
    colorSecundario: string | null
    creadoPor: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantCountAggregateOutputType = {
    id: number
    slug: number
    codigo: number
    nombre: number
    nombreCorto: number
    tipoEntidad: number
    nit: number
    municipio: number
    departamento: number
    codigoDivipola: number
    dominioPrincipal: number
    dominioPersonalizado: number
    databaseUrl: number
    databaseName: number
    plan: number
    activo: number
    suspendido: number
    motivoSuspension: number
    fechaActivacion: number
    fechaVencimiento: number
    modulosActivos: number
    emailContacto: number
    telefonoContacto: number
    nombreContacto: number
    logoUrl: number
    colorPrimario: number
    colorSecundario: number
    creadoPor: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantMinAggregateInputType = {
    id?: true
    slug?: true
    codigo?: true
    nombre?: true
    nombreCorto?: true
    tipoEntidad?: true
    nit?: true
    municipio?: true
    departamento?: true
    codigoDivipola?: true
    dominioPrincipal?: true
    dominioPersonalizado?: true
    databaseUrl?: true
    databaseName?: true
    plan?: true
    activo?: true
    suspendido?: true
    motivoSuspension?: true
    fechaActivacion?: true
    fechaVencimiento?: true
    emailContacto?: true
    telefonoContacto?: true
    nombreContacto?: true
    logoUrl?: true
    colorPrimario?: true
    colorSecundario?: true
    creadoPor?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantMaxAggregateInputType = {
    id?: true
    slug?: true
    codigo?: true
    nombre?: true
    nombreCorto?: true
    tipoEntidad?: true
    nit?: true
    municipio?: true
    departamento?: true
    codigoDivipola?: true
    dominioPrincipal?: true
    dominioPersonalizado?: true
    databaseUrl?: true
    databaseName?: true
    plan?: true
    activo?: true
    suspendido?: true
    motivoSuspension?: true
    fechaActivacion?: true
    fechaVencimiento?: true
    emailContacto?: true
    telefonoContacto?: true
    nombreContacto?: true
    logoUrl?: true
    colorPrimario?: true
    colorSecundario?: true
    creadoPor?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantCountAggregateInputType = {
    id?: true
    slug?: true
    codigo?: true
    nombre?: true
    nombreCorto?: true
    tipoEntidad?: true
    nit?: true
    municipio?: true
    departamento?: true
    codigoDivipola?: true
    dominioPrincipal?: true
    dominioPersonalizado?: true
    databaseUrl?: true
    databaseName?: true
    plan?: true
    activo?: true
    suspendido?: true
    motivoSuspension?: true
    fechaActivacion?: true
    fechaVencimiento?: true
    modulosActivos?: true
    emailContacto?: true
    telefonoContacto?: true
    nombreContacto?: true
    logoUrl?: true
    colorPrimario?: true
    colorSecundario?: true
    creadoPor?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id: string
    slug: string
    codigo: string
    nombre: string
    nombreCorto: string
    tipoEntidad: $Enums.TipoEntidad
    nit: string | null
    municipio: string
    departamento: string
    codigoDivipola: string | null
    dominioPrincipal: string
    dominioPersonalizado: string | null
    databaseUrl: string
    databaseName: string
    plan: $Enums.PlanTenant
    activo: boolean
    suspendido: boolean
    motivoSuspension: string | null
    fechaActivacion: Date | null
    fechaVencimiento: Date | null
    modulosActivos: JsonValue
    emailContacto: string
    telefonoContacto: string | null
    nombreContacto: string | null
    logoUrl: string | null
    colorPrimario: string | null
    colorSecundario: string | null
    creadoPor: string | null
    createdAt: Date
    updatedAt: Date
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    codigo?: boolean
    nombre?: boolean
    nombreCorto?: boolean
    tipoEntidad?: boolean
    nit?: boolean
    municipio?: boolean
    departamento?: boolean
    codigoDivipola?: boolean
    dominioPrincipal?: boolean
    dominioPersonalizado?: boolean
    databaseUrl?: boolean
    databaseName?: boolean
    plan?: boolean
    activo?: boolean
    suspendido?: boolean
    motivoSuspension?: boolean
    fechaActivacion?: boolean
    fechaVencimiento?: boolean
    modulosActivos?: boolean
    emailContacto?: boolean
    telefonoContacto?: boolean
    nombreContacto?: boolean
    logoUrl?: boolean
    colorPrimario?: boolean
    colorSecundario?: boolean
    creadoPor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    eventos?: boolean | Tenant$eventosArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    codigo?: boolean
    nombre?: boolean
    nombreCorto?: boolean
    tipoEntidad?: boolean
    nit?: boolean
    municipio?: boolean
    departamento?: boolean
    codigoDivipola?: boolean
    dominioPrincipal?: boolean
    dominioPersonalizado?: boolean
    databaseUrl?: boolean
    databaseName?: boolean
    plan?: boolean
    activo?: boolean
    suspendido?: boolean
    motivoSuspension?: boolean
    fechaActivacion?: boolean
    fechaVencimiento?: boolean
    modulosActivos?: boolean
    emailContacto?: boolean
    telefonoContacto?: boolean
    nombreContacto?: boolean
    logoUrl?: boolean
    colorPrimario?: boolean
    colorSecundario?: boolean
    creadoPor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    codigo?: boolean
    nombre?: boolean
    nombreCorto?: boolean
    tipoEntidad?: boolean
    nit?: boolean
    municipio?: boolean
    departamento?: boolean
    codigoDivipola?: boolean
    dominioPrincipal?: boolean
    dominioPersonalizado?: boolean
    databaseUrl?: boolean
    databaseName?: boolean
    plan?: boolean
    activo?: boolean
    suspendido?: boolean
    motivoSuspension?: boolean
    fechaActivacion?: boolean
    fechaVencimiento?: boolean
    modulosActivos?: boolean
    emailContacto?: boolean
    telefonoContacto?: boolean
    nombreContacto?: boolean
    logoUrl?: boolean
    colorPrimario?: boolean
    colorSecundario?: boolean
    creadoPor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectScalar = {
    id?: boolean
    slug?: boolean
    codigo?: boolean
    nombre?: boolean
    nombreCorto?: boolean
    tipoEntidad?: boolean
    nit?: boolean
    municipio?: boolean
    departamento?: boolean
    codigoDivipola?: boolean
    dominioPrincipal?: boolean
    dominioPersonalizado?: boolean
    databaseUrl?: boolean
    databaseName?: boolean
    plan?: boolean
    activo?: boolean
    suspendido?: boolean
    motivoSuspension?: boolean
    fechaActivacion?: boolean
    fechaVencimiento?: boolean
    modulosActivos?: boolean
    emailContacto?: boolean
    telefonoContacto?: boolean
    nombreContacto?: boolean
    logoUrl?: boolean
    colorPrimario?: boolean
    colorSecundario?: boolean
    creadoPor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "slug" | "codigo" | "nombre" | "nombreCorto" | "tipoEntidad" | "nit" | "municipio" | "departamento" | "codigoDivipola" | "dominioPrincipal" | "dominioPersonalizado" | "databaseUrl" | "databaseName" | "plan" | "activo" | "suspendido" | "motivoSuspension" | "fechaActivacion" | "fechaVencimiento" | "modulosActivos" | "emailContacto" | "telefonoContacto" | "nombreContacto" | "logoUrl" | "colorPrimario" | "colorSecundario" | "creadoPor" | "createdAt" | "updatedAt", ExtArgs["result"]["tenant"]>
  export type TenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    eventos?: boolean | Tenant$eventosArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TenantIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {
      eventos: Prisma.$EventoTenantPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      slug: string
      codigo: string
      nombre: string
      nombreCorto: string
      tipoEntidad: $Enums.TipoEntidad
      nit: string | null
      municipio: string
      departamento: string
      codigoDivipola: string | null
      dominioPrincipal: string
      dominioPersonalizado: string | null
      databaseUrl: string
      databaseName: string
      plan: $Enums.PlanTenant
      activo: boolean
      suspendido: boolean
      motivoSuspension: string | null
      fechaActivacion: Date | null
      fechaVencimiento: Date | null
      modulosActivos: Prisma.JsonValue
      emailContacto: string
      telefonoContacto: string | null
      nombreContacto: string | null
      logoUrl: string | null
      colorPrimario: string | null
      colorSecundario: string | null
      creadoPor: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants and returns the data updated in the database.
     * @param {TenantUpdateManyAndReturnArgs} args - Arguments to update many Tenants.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    eventos<T extends Tenant$eventosArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$eventosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EventoTenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tenant model
   */
  interface TenantFieldRefs {
    readonly id: FieldRef<"Tenant", 'String'>
    readonly slug: FieldRef<"Tenant", 'String'>
    readonly codigo: FieldRef<"Tenant", 'String'>
    readonly nombre: FieldRef<"Tenant", 'String'>
    readonly nombreCorto: FieldRef<"Tenant", 'String'>
    readonly tipoEntidad: FieldRef<"Tenant", 'TipoEntidad'>
    readonly nit: FieldRef<"Tenant", 'String'>
    readonly municipio: FieldRef<"Tenant", 'String'>
    readonly departamento: FieldRef<"Tenant", 'String'>
    readonly codigoDivipola: FieldRef<"Tenant", 'String'>
    readonly dominioPrincipal: FieldRef<"Tenant", 'String'>
    readonly dominioPersonalizado: FieldRef<"Tenant", 'String'>
    readonly databaseUrl: FieldRef<"Tenant", 'String'>
    readonly databaseName: FieldRef<"Tenant", 'String'>
    readonly plan: FieldRef<"Tenant", 'PlanTenant'>
    readonly activo: FieldRef<"Tenant", 'Boolean'>
    readonly suspendido: FieldRef<"Tenant", 'Boolean'>
    readonly motivoSuspension: FieldRef<"Tenant", 'String'>
    readonly fechaActivacion: FieldRef<"Tenant", 'DateTime'>
    readonly fechaVencimiento: FieldRef<"Tenant", 'DateTime'>
    readonly modulosActivos: FieldRef<"Tenant", 'Json'>
    readonly emailContacto: FieldRef<"Tenant", 'String'>
    readonly telefonoContacto: FieldRef<"Tenant", 'String'>
    readonly nombreContacto: FieldRef<"Tenant", 'String'>
    readonly logoUrl: FieldRef<"Tenant", 'String'>
    readonly colorPrimario: FieldRef<"Tenant", 'String'>
    readonly colorSecundario: FieldRef<"Tenant", 'String'>
    readonly creadoPor: FieldRef<"Tenant", 'String'>
    readonly createdAt: FieldRef<"Tenant", 'DateTime'>
    readonly updatedAt: FieldRef<"Tenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant updateManyAndReturn
   */
  export type TenantUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to delete.
     */
    limit?: number
  }

  /**
   * Tenant.eventos
   */
  export type Tenant$eventosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoTenant
     */
    select?: EventoTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EventoTenant
     */
    omit?: EventoTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventoTenantInclude<ExtArgs> | null
    where?: EventoTenantWhereInput
    orderBy?: EventoTenantOrderByWithRelationInput | EventoTenantOrderByWithRelationInput[]
    cursor?: EventoTenantWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EventoTenantScalarFieldEnum | EventoTenantScalarFieldEnum[]
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
  }


  /**
   * Model SuperAdmin
   */

  export type AggregateSuperAdmin = {
    _count: SuperAdminCountAggregateOutputType | null
    _min: SuperAdminMinAggregateOutputType | null
    _max: SuperAdminMaxAggregateOutputType | null
  }

  export type SuperAdminMinAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    nombre: string | null
    activo: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SuperAdminMaxAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    nombre: string | null
    activo: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SuperAdminCountAggregateOutputType = {
    id: number
    email: number
    password: number
    nombre: number
    activo: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SuperAdminMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    nombre?: true
    activo?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SuperAdminMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    nombre?: true
    activo?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SuperAdminCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    nombre?: true
    activo?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SuperAdminAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SuperAdmin to aggregate.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SuperAdmins
    **/
    _count?: true | SuperAdminCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SuperAdminMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SuperAdminMaxAggregateInputType
  }

  export type GetSuperAdminAggregateType<T extends SuperAdminAggregateArgs> = {
        [P in keyof T & keyof AggregateSuperAdmin]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSuperAdmin[P]>
      : GetScalarType<T[P], AggregateSuperAdmin[P]>
  }




  export type SuperAdminGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SuperAdminWhereInput
    orderBy?: SuperAdminOrderByWithAggregationInput | SuperAdminOrderByWithAggregationInput[]
    by: SuperAdminScalarFieldEnum[] | SuperAdminScalarFieldEnum
    having?: SuperAdminScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SuperAdminCountAggregateInputType | true
    _min?: SuperAdminMinAggregateInputType
    _max?: SuperAdminMaxAggregateInputType
  }

  export type SuperAdminGroupByOutputType = {
    id: string
    email: string
    password: string
    nombre: string
    activo: boolean
    createdAt: Date
    updatedAt: Date
    _count: SuperAdminCountAggregateOutputType | null
    _min: SuperAdminMinAggregateOutputType | null
    _max: SuperAdminMaxAggregateOutputType | null
  }

  type GetSuperAdminGroupByPayload<T extends SuperAdminGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SuperAdminGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SuperAdminGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SuperAdminGroupByOutputType[P]>
            : GetScalarType<T[P], SuperAdminGroupByOutputType[P]>
        }
      >
    >


  export type SuperAdminSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    nombre?: boolean
    activo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["superAdmin"]>

  export type SuperAdminSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    nombre?: boolean
    activo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["superAdmin"]>

  export type SuperAdminSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    nombre?: boolean
    activo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["superAdmin"]>

  export type SuperAdminSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    nombre?: boolean
    activo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SuperAdminOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "password" | "nombre" | "activo" | "createdAt" | "updatedAt", ExtArgs["result"]["superAdmin"]>

  export type $SuperAdminPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SuperAdmin"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      password: string
      nombre: string
      activo: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["superAdmin"]>
    composites: {}
  }

  type SuperAdminGetPayload<S extends boolean | null | undefined | SuperAdminDefaultArgs> = $Result.GetResult<Prisma.$SuperAdminPayload, S>

  type SuperAdminCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SuperAdminFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SuperAdminCountAggregateInputType | true
    }

  export interface SuperAdminDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SuperAdmin'], meta: { name: 'SuperAdmin' } }
    /**
     * Find zero or one SuperAdmin that matches the filter.
     * @param {SuperAdminFindUniqueArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SuperAdminFindUniqueArgs>(args: SelectSubset<T, SuperAdminFindUniqueArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SuperAdmin that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SuperAdminFindUniqueOrThrowArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SuperAdminFindUniqueOrThrowArgs>(args: SelectSubset<T, SuperAdminFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SuperAdmin that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminFindFirstArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SuperAdminFindFirstArgs>(args?: SelectSubset<T, SuperAdminFindFirstArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SuperAdmin that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminFindFirstOrThrowArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SuperAdminFindFirstOrThrowArgs>(args?: SelectSubset<T, SuperAdminFindFirstOrThrowArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SuperAdmins that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SuperAdmins
     * const superAdmins = await prisma.superAdmin.findMany()
     * 
     * // Get first 10 SuperAdmins
     * const superAdmins = await prisma.superAdmin.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const superAdminWithIdOnly = await prisma.superAdmin.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SuperAdminFindManyArgs>(args?: SelectSubset<T, SuperAdminFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SuperAdmin.
     * @param {SuperAdminCreateArgs} args - Arguments to create a SuperAdmin.
     * @example
     * // Create one SuperAdmin
     * const SuperAdmin = await prisma.superAdmin.create({
     *   data: {
     *     // ... data to create a SuperAdmin
     *   }
     * })
     * 
     */
    create<T extends SuperAdminCreateArgs>(args: SelectSubset<T, SuperAdminCreateArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SuperAdmins.
     * @param {SuperAdminCreateManyArgs} args - Arguments to create many SuperAdmins.
     * @example
     * // Create many SuperAdmins
     * const superAdmin = await prisma.superAdmin.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SuperAdminCreateManyArgs>(args?: SelectSubset<T, SuperAdminCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SuperAdmins and returns the data saved in the database.
     * @param {SuperAdminCreateManyAndReturnArgs} args - Arguments to create many SuperAdmins.
     * @example
     * // Create many SuperAdmins
     * const superAdmin = await prisma.superAdmin.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SuperAdmins and only return the `id`
     * const superAdminWithIdOnly = await prisma.superAdmin.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SuperAdminCreateManyAndReturnArgs>(args?: SelectSubset<T, SuperAdminCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SuperAdmin.
     * @param {SuperAdminDeleteArgs} args - Arguments to delete one SuperAdmin.
     * @example
     * // Delete one SuperAdmin
     * const SuperAdmin = await prisma.superAdmin.delete({
     *   where: {
     *     // ... filter to delete one SuperAdmin
     *   }
     * })
     * 
     */
    delete<T extends SuperAdminDeleteArgs>(args: SelectSubset<T, SuperAdminDeleteArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SuperAdmin.
     * @param {SuperAdminUpdateArgs} args - Arguments to update one SuperAdmin.
     * @example
     * // Update one SuperAdmin
     * const superAdmin = await prisma.superAdmin.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SuperAdminUpdateArgs>(args: SelectSubset<T, SuperAdminUpdateArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SuperAdmins.
     * @param {SuperAdminDeleteManyArgs} args - Arguments to filter SuperAdmins to delete.
     * @example
     * // Delete a few SuperAdmins
     * const { count } = await prisma.superAdmin.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SuperAdminDeleteManyArgs>(args?: SelectSubset<T, SuperAdminDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SuperAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SuperAdmins
     * const superAdmin = await prisma.superAdmin.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SuperAdminUpdateManyArgs>(args: SelectSubset<T, SuperAdminUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SuperAdmins and returns the data updated in the database.
     * @param {SuperAdminUpdateManyAndReturnArgs} args - Arguments to update many SuperAdmins.
     * @example
     * // Update many SuperAdmins
     * const superAdmin = await prisma.superAdmin.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SuperAdmins and only return the `id`
     * const superAdminWithIdOnly = await prisma.superAdmin.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SuperAdminUpdateManyAndReturnArgs>(args: SelectSubset<T, SuperAdminUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SuperAdmin.
     * @param {SuperAdminUpsertArgs} args - Arguments to update or create a SuperAdmin.
     * @example
     * // Update or create a SuperAdmin
     * const superAdmin = await prisma.superAdmin.upsert({
     *   create: {
     *     // ... data to create a SuperAdmin
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SuperAdmin we want to update
     *   }
     * })
     */
    upsert<T extends SuperAdminUpsertArgs>(args: SelectSubset<T, SuperAdminUpsertArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SuperAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminCountArgs} args - Arguments to filter SuperAdmins to count.
     * @example
     * // Count the number of SuperAdmins
     * const count = await prisma.superAdmin.count({
     *   where: {
     *     // ... the filter for the SuperAdmins we want to count
     *   }
     * })
    **/
    count<T extends SuperAdminCountArgs>(
      args?: Subset<T, SuperAdminCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SuperAdminCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SuperAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SuperAdminAggregateArgs>(args: Subset<T, SuperAdminAggregateArgs>): Prisma.PrismaPromise<GetSuperAdminAggregateType<T>>

    /**
     * Group by SuperAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SuperAdminGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SuperAdminGroupByArgs['orderBy'] }
        : { orderBy?: SuperAdminGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SuperAdminGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSuperAdminGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SuperAdmin model
   */
  readonly fields: SuperAdminFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SuperAdmin.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SuperAdminClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SuperAdmin model
   */
  interface SuperAdminFieldRefs {
    readonly id: FieldRef<"SuperAdmin", 'String'>
    readonly email: FieldRef<"SuperAdmin", 'String'>
    readonly password: FieldRef<"SuperAdmin", 'String'>
    readonly nombre: FieldRef<"SuperAdmin", 'String'>
    readonly activo: FieldRef<"SuperAdmin", 'Boolean'>
    readonly createdAt: FieldRef<"SuperAdmin", 'DateTime'>
    readonly updatedAt: FieldRef<"SuperAdmin", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SuperAdmin findUnique
   */
  export type SuperAdminFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin findUniqueOrThrow
   */
  export type SuperAdminFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin findFirst
   */
  export type SuperAdminFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SuperAdmins.
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SuperAdmins.
     */
    distinct?: SuperAdminScalarFieldEnum | SuperAdminScalarFieldEnum[]
  }

  /**
   * SuperAdmin findFirstOrThrow
   */
  export type SuperAdminFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SuperAdmins.
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SuperAdmins.
     */
    distinct?: SuperAdminScalarFieldEnum | SuperAdminScalarFieldEnum[]
  }

  /**
   * SuperAdmin findMany
   */
  export type SuperAdminFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmins to fetch.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SuperAdmins.
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    distinct?: SuperAdminScalarFieldEnum | SuperAdminScalarFieldEnum[]
  }

  /**
   * SuperAdmin create
   */
  export type SuperAdminCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data needed to create a SuperAdmin.
     */
    data: XOR<SuperAdminCreateInput, SuperAdminUncheckedCreateInput>
  }

  /**
   * SuperAdmin createMany
   */
  export type SuperAdminCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SuperAdmins.
     */
    data: SuperAdminCreateManyInput | SuperAdminCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SuperAdmin createManyAndReturn
   */
  export type SuperAdminCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data used to create many SuperAdmins.
     */
    data: SuperAdminCreateManyInput | SuperAdminCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SuperAdmin update
   */
  export type SuperAdminUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data needed to update a SuperAdmin.
     */
    data: XOR<SuperAdminUpdateInput, SuperAdminUncheckedUpdateInput>
    /**
     * Choose, which SuperAdmin to update.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin updateMany
   */
  export type SuperAdminUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SuperAdmins.
     */
    data: XOR<SuperAdminUpdateManyMutationInput, SuperAdminUncheckedUpdateManyInput>
    /**
     * Filter which SuperAdmins to update
     */
    where?: SuperAdminWhereInput
    /**
     * Limit how many SuperAdmins to update.
     */
    limit?: number
  }

  /**
   * SuperAdmin updateManyAndReturn
   */
  export type SuperAdminUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data used to update SuperAdmins.
     */
    data: XOR<SuperAdminUpdateManyMutationInput, SuperAdminUncheckedUpdateManyInput>
    /**
     * Filter which SuperAdmins to update
     */
    where?: SuperAdminWhereInput
    /**
     * Limit how many SuperAdmins to update.
     */
    limit?: number
  }

  /**
   * SuperAdmin upsert
   */
  export type SuperAdminUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The filter to search for the SuperAdmin to update in case it exists.
     */
    where: SuperAdminWhereUniqueInput
    /**
     * In case the SuperAdmin found by the `where` argument doesn't exist, create a new SuperAdmin with this data.
     */
    create: XOR<SuperAdminCreateInput, SuperAdminUncheckedCreateInput>
    /**
     * In case the SuperAdmin was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SuperAdminUpdateInput, SuperAdminUncheckedUpdateInput>
  }

  /**
   * SuperAdmin delete
   */
  export type SuperAdminDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter which SuperAdmin to delete.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin deleteMany
   */
  export type SuperAdminDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SuperAdmins to delete
     */
    where?: SuperAdminWhereInput
    /**
     * Limit how many SuperAdmins to delete.
     */
    limit?: number
  }

  /**
   * SuperAdmin without action
   */
  export type SuperAdminDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
  }


  /**
   * Model EventoTenant
   */

  export type AggregateEventoTenant = {
    _count: EventoTenantCountAggregateOutputType | null
    _min: EventoTenantMinAggregateOutputType | null
    _max: EventoTenantMaxAggregateOutputType | null
  }

  export type EventoTenantMinAggregateOutputType = {
    id: string | null
    tipo: string | null
    descripcion: string | null
    tenantId: string | null
    creadoPor: string | null
    createdAt: Date | null
  }

  export type EventoTenantMaxAggregateOutputType = {
    id: string | null
    tipo: string | null
    descripcion: string | null
    tenantId: string | null
    creadoPor: string | null
    createdAt: Date | null
  }

  export type EventoTenantCountAggregateOutputType = {
    id: number
    tipo: number
    descripcion: number
    datos: number
    tenantId: number
    creadoPor: number
    createdAt: number
    _all: number
  }


  export type EventoTenantMinAggregateInputType = {
    id?: true
    tipo?: true
    descripcion?: true
    tenantId?: true
    creadoPor?: true
    createdAt?: true
  }

  export type EventoTenantMaxAggregateInputType = {
    id?: true
    tipo?: true
    descripcion?: true
    tenantId?: true
    creadoPor?: true
    createdAt?: true
  }

  export type EventoTenantCountAggregateInputType = {
    id?: true
    tipo?: true
    descripcion?: true
    datos?: true
    tenantId?: true
    creadoPor?: true
    createdAt?: true
    _all?: true
  }

  export type EventoTenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EventoTenant to aggregate.
     */
    where?: EventoTenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EventoTenants to fetch.
     */
    orderBy?: EventoTenantOrderByWithRelationInput | EventoTenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EventoTenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EventoTenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EventoTenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EventoTenants
    **/
    _count?: true | EventoTenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EventoTenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EventoTenantMaxAggregateInputType
  }

  export type GetEventoTenantAggregateType<T extends EventoTenantAggregateArgs> = {
        [P in keyof T & keyof AggregateEventoTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEventoTenant[P]>
      : GetScalarType<T[P], AggregateEventoTenant[P]>
  }




  export type EventoTenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EventoTenantWhereInput
    orderBy?: EventoTenantOrderByWithAggregationInput | EventoTenantOrderByWithAggregationInput[]
    by: EventoTenantScalarFieldEnum[] | EventoTenantScalarFieldEnum
    having?: EventoTenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EventoTenantCountAggregateInputType | true
    _min?: EventoTenantMinAggregateInputType
    _max?: EventoTenantMaxAggregateInputType
  }

  export type EventoTenantGroupByOutputType = {
    id: string
    tipo: string
    descripcion: string | null
    datos: JsonValue | null
    tenantId: string
    creadoPor: string | null
    createdAt: Date
    _count: EventoTenantCountAggregateOutputType | null
    _min: EventoTenantMinAggregateOutputType | null
    _max: EventoTenantMaxAggregateOutputType | null
  }

  type GetEventoTenantGroupByPayload<T extends EventoTenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EventoTenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EventoTenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EventoTenantGroupByOutputType[P]>
            : GetScalarType<T[P], EventoTenantGroupByOutputType[P]>
        }
      >
    >


  export type EventoTenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tipo?: boolean
    descripcion?: boolean
    datos?: boolean
    tenantId?: boolean
    creadoPor?: boolean
    createdAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["eventoTenant"]>

  export type EventoTenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tipo?: boolean
    descripcion?: boolean
    datos?: boolean
    tenantId?: boolean
    creadoPor?: boolean
    createdAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["eventoTenant"]>

  export type EventoTenantSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tipo?: boolean
    descripcion?: boolean
    datos?: boolean
    tenantId?: boolean
    creadoPor?: boolean
    createdAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["eventoTenant"]>

  export type EventoTenantSelectScalar = {
    id?: boolean
    tipo?: boolean
    descripcion?: boolean
    datos?: boolean
    tenantId?: boolean
    creadoPor?: boolean
    createdAt?: boolean
  }

  export type EventoTenantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tipo" | "descripcion" | "datos" | "tenantId" | "creadoPor" | "createdAt", ExtArgs["result"]["eventoTenant"]>
  export type EventoTenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type EventoTenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type EventoTenantIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $EventoTenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EventoTenant"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tipo: string
      descripcion: string | null
      datos: Prisma.JsonValue | null
      tenantId: string
      creadoPor: string | null
      createdAt: Date
    }, ExtArgs["result"]["eventoTenant"]>
    composites: {}
  }

  type EventoTenantGetPayload<S extends boolean | null | undefined | EventoTenantDefaultArgs> = $Result.GetResult<Prisma.$EventoTenantPayload, S>

  type EventoTenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EventoTenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EventoTenantCountAggregateInputType | true
    }

  export interface EventoTenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EventoTenant'], meta: { name: 'EventoTenant' } }
    /**
     * Find zero or one EventoTenant that matches the filter.
     * @param {EventoTenantFindUniqueArgs} args - Arguments to find a EventoTenant
     * @example
     * // Get one EventoTenant
     * const eventoTenant = await prisma.eventoTenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EventoTenantFindUniqueArgs>(args: SelectSubset<T, EventoTenantFindUniqueArgs<ExtArgs>>): Prisma__EventoTenantClient<$Result.GetResult<Prisma.$EventoTenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one EventoTenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EventoTenantFindUniqueOrThrowArgs} args - Arguments to find a EventoTenant
     * @example
     * // Get one EventoTenant
     * const eventoTenant = await prisma.eventoTenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EventoTenantFindUniqueOrThrowArgs>(args: SelectSubset<T, EventoTenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EventoTenantClient<$Result.GetResult<Prisma.$EventoTenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EventoTenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventoTenantFindFirstArgs} args - Arguments to find a EventoTenant
     * @example
     * // Get one EventoTenant
     * const eventoTenant = await prisma.eventoTenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EventoTenantFindFirstArgs>(args?: SelectSubset<T, EventoTenantFindFirstArgs<ExtArgs>>): Prisma__EventoTenantClient<$Result.GetResult<Prisma.$EventoTenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EventoTenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventoTenantFindFirstOrThrowArgs} args - Arguments to find a EventoTenant
     * @example
     * // Get one EventoTenant
     * const eventoTenant = await prisma.eventoTenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EventoTenantFindFirstOrThrowArgs>(args?: SelectSubset<T, EventoTenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__EventoTenantClient<$Result.GetResult<Prisma.$EventoTenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more EventoTenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventoTenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EventoTenants
     * const eventoTenants = await prisma.eventoTenant.findMany()
     * 
     * // Get first 10 EventoTenants
     * const eventoTenants = await prisma.eventoTenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const eventoTenantWithIdOnly = await prisma.eventoTenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EventoTenantFindManyArgs>(args?: SelectSubset<T, EventoTenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EventoTenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a EventoTenant.
     * @param {EventoTenantCreateArgs} args - Arguments to create a EventoTenant.
     * @example
     * // Create one EventoTenant
     * const EventoTenant = await prisma.eventoTenant.create({
     *   data: {
     *     // ... data to create a EventoTenant
     *   }
     * })
     * 
     */
    create<T extends EventoTenantCreateArgs>(args: SelectSubset<T, EventoTenantCreateArgs<ExtArgs>>): Prisma__EventoTenantClient<$Result.GetResult<Prisma.$EventoTenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many EventoTenants.
     * @param {EventoTenantCreateManyArgs} args - Arguments to create many EventoTenants.
     * @example
     * // Create many EventoTenants
     * const eventoTenant = await prisma.eventoTenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EventoTenantCreateManyArgs>(args?: SelectSubset<T, EventoTenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EventoTenants and returns the data saved in the database.
     * @param {EventoTenantCreateManyAndReturnArgs} args - Arguments to create many EventoTenants.
     * @example
     * // Create many EventoTenants
     * const eventoTenant = await prisma.eventoTenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EventoTenants and only return the `id`
     * const eventoTenantWithIdOnly = await prisma.eventoTenant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EventoTenantCreateManyAndReturnArgs>(args?: SelectSubset<T, EventoTenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EventoTenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a EventoTenant.
     * @param {EventoTenantDeleteArgs} args - Arguments to delete one EventoTenant.
     * @example
     * // Delete one EventoTenant
     * const EventoTenant = await prisma.eventoTenant.delete({
     *   where: {
     *     // ... filter to delete one EventoTenant
     *   }
     * })
     * 
     */
    delete<T extends EventoTenantDeleteArgs>(args: SelectSubset<T, EventoTenantDeleteArgs<ExtArgs>>): Prisma__EventoTenantClient<$Result.GetResult<Prisma.$EventoTenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one EventoTenant.
     * @param {EventoTenantUpdateArgs} args - Arguments to update one EventoTenant.
     * @example
     * // Update one EventoTenant
     * const eventoTenant = await prisma.eventoTenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EventoTenantUpdateArgs>(args: SelectSubset<T, EventoTenantUpdateArgs<ExtArgs>>): Prisma__EventoTenantClient<$Result.GetResult<Prisma.$EventoTenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more EventoTenants.
     * @param {EventoTenantDeleteManyArgs} args - Arguments to filter EventoTenants to delete.
     * @example
     * // Delete a few EventoTenants
     * const { count } = await prisma.eventoTenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EventoTenantDeleteManyArgs>(args?: SelectSubset<T, EventoTenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EventoTenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventoTenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EventoTenants
     * const eventoTenant = await prisma.eventoTenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EventoTenantUpdateManyArgs>(args: SelectSubset<T, EventoTenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EventoTenants and returns the data updated in the database.
     * @param {EventoTenantUpdateManyAndReturnArgs} args - Arguments to update many EventoTenants.
     * @example
     * // Update many EventoTenants
     * const eventoTenant = await prisma.eventoTenant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more EventoTenants and only return the `id`
     * const eventoTenantWithIdOnly = await prisma.eventoTenant.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EventoTenantUpdateManyAndReturnArgs>(args: SelectSubset<T, EventoTenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EventoTenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one EventoTenant.
     * @param {EventoTenantUpsertArgs} args - Arguments to update or create a EventoTenant.
     * @example
     * // Update or create a EventoTenant
     * const eventoTenant = await prisma.eventoTenant.upsert({
     *   create: {
     *     // ... data to create a EventoTenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EventoTenant we want to update
     *   }
     * })
     */
    upsert<T extends EventoTenantUpsertArgs>(args: SelectSubset<T, EventoTenantUpsertArgs<ExtArgs>>): Prisma__EventoTenantClient<$Result.GetResult<Prisma.$EventoTenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of EventoTenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventoTenantCountArgs} args - Arguments to filter EventoTenants to count.
     * @example
     * // Count the number of EventoTenants
     * const count = await prisma.eventoTenant.count({
     *   where: {
     *     // ... the filter for the EventoTenants we want to count
     *   }
     * })
    **/
    count<T extends EventoTenantCountArgs>(
      args?: Subset<T, EventoTenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EventoTenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EventoTenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventoTenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EventoTenantAggregateArgs>(args: Subset<T, EventoTenantAggregateArgs>): Prisma.PrismaPromise<GetEventoTenantAggregateType<T>>

    /**
     * Group by EventoTenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventoTenantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EventoTenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EventoTenantGroupByArgs['orderBy'] }
        : { orderBy?: EventoTenantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EventoTenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEventoTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EventoTenant model
   */
  readonly fields: EventoTenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EventoTenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EventoTenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EventoTenant model
   */
  interface EventoTenantFieldRefs {
    readonly id: FieldRef<"EventoTenant", 'String'>
    readonly tipo: FieldRef<"EventoTenant", 'String'>
    readonly descripcion: FieldRef<"EventoTenant", 'String'>
    readonly datos: FieldRef<"EventoTenant", 'Json'>
    readonly tenantId: FieldRef<"EventoTenant", 'String'>
    readonly creadoPor: FieldRef<"EventoTenant", 'String'>
    readonly createdAt: FieldRef<"EventoTenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EventoTenant findUnique
   */
  export type EventoTenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoTenant
     */
    select?: EventoTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EventoTenant
     */
    omit?: EventoTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventoTenantInclude<ExtArgs> | null
    /**
     * Filter, which EventoTenant to fetch.
     */
    where: EventoTenantWhereUniqueInput
  }

  /**
   * EventoTenant findUniqueOrThrow
   */
  export type EventoTenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoTenant
     */
    select?: EventoTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EventoTenant
     */
    omit?: EventoTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventoTenantInclude<ExtArgs> | null
    /**
     * Filter, which EventoTenant to fetch.
     */
    where: EventoTenantWhereUniqueInput
  }

  /**
   * EventoTenant findFirst
   */
  export type EventoTenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoTenant
     */
    select?: EventoTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EventoTenant
     */
    omit?: EventoTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventoTenantInclude<ExtArgs> | null
    /**
     * Filter, which EventoTenant to fetch.
     */
    where?: EventoTenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EventoTenants to fetch.
     */
    orderBy?: EventoTenantOrderByWithRelationInput | EventoTenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EventoTenants.
     */
    cursor?: EventoTenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EventoTenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EventoTenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EventoTenants.
     */
    distinct?: EventoTenantScalarFieldEnum | EventoTenantScalarFieldEnum[]
  }

  /**
   * EventoTenant findFirstOrThrow
   */
  export type EventoTenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoTenant
     */
    select?: EventoTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EventoTenant
     */
    omit?: EventoTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventoTenantInclude<ExtArgs> | null
    /**
     * Filter, which EventoTenant to fetch.
     */
    where?: EventoTenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EventoTenants to fetch.
     */
    orderBy?: EventoTenantOrderByWithRelationInput | EventoTenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EventoTenants.
     */
    cursor?: EventoTenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EventoTenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EventoTenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EventoTenants.
     */
    distinct?: EventoTenantScalarFieldEnum | EventoTenantScalarFieldEnum[]
  }

  /**
   * EventoTenant findMany
   */
  export type EventoTenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoTenant
     */
    select?: EventoTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EventoTenant
     */
    omit?: EventoTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventoTenantInclude<ExtArgs> | null
    /**
     * Filter, which EventoTenants to fetch.
     */
    where?: EventoTenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EventoTenants to fetch.
     */
    orderBy?: EventoTenantOrderByWithRelationInput | EventoTenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EventoTenants.
     */
    cursor?: EventoTenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EventoTenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EventoTenants.
     */
    skip?: number
    distinct?: EventoTenantScalarFieldEnum | EventoTenantScalarFieldEnum[]
  }

  /**
   * EventoTenant create
   */
  export type EventoTenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoTenant
     */
    select?: EventoTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EventoTenant
     */
    omit?: EventoTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventoTenantInclude<ExtArgs> | null
    /**
     * The data needed to create a EventoTenant.
     */
    data: XOR<EventoTenantCreateInput, EventoTenantUncheckedCreateInput>
  }

  /**
   * EventoTenant createMany
   */
  export type EventoTenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EventoTenants.
     */
    data: EventoTenantCreateManyInput | EventoTenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EventoTenant createManyAndReturn
   */
  export type EventoTenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoTenant
     */
    select?: EventoTenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EventoTenant
     */
    omit?: EventoTenantOmit<ExtArgs> | null
    /**
     * The data used to create many EventoTenants.
     */
    data: EventoTenantCreateManyInput | EventoTenantCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventoTenantIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EventoTenant update
   */
  export type EventoTenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoTenant
     */
    select?: EventoTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EventoTenant
     */
    omit?: EventoTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventoTenantInclude<ExtArgs> | null
    /**
     * The data needed to update a EventoTenant.
     */
    data: XOR<EventoTenantUpdateInput, EventoTenantUncheckedUpdateInput>
    /**
     * Choose, which EventoTenant to update.
     */
    where: EventoTenantWhereUniqueInput
  }

  /**
   * EventoTenant updateMany
   */
  export type EventoTenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EventoTenants.
     */
    data: XOR<EventoTenantUpdateManyMutationInput, EventoTenantUncheckedUpdateManyInput>
    /**
     * Filter which EventoTenants to update
     */
    where?: EventoTenantWhereInput
    /**
     * Limit how many EventoTenants to update.
     */
    limit?: number
  }

  /**
   * EventoTenant updateManyAndReturn
   */
  export type EventoTenantUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoTenant
     */
    select?: EventoTenantSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EventoTenant
     */
    omit?: EventoTenantOmit<ExtArgs> | null
    /**
     * The data used to update EventoTenants.
     */
    data: XOR<EventoTenantUpdateManyMutationInput, EventoTenantUncheckedUpdateManyInput>
    /**
     * Filter which EventoTenants to update
     */
    where?: EventoTenantWhereInput
    /**
     * Limit how many EventoTenants to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventoTenantIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * EventoTenant upsert
   */
  export type EventoTenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoTenant
     */
    select?: EventoTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EventoTenant
     */
    omit?: EventoTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventoTenantInclude<ExtArgs> | null
    /**
     * The filter to search for the EventoTenant to update in case it exists.
     */
    where: EventoTenantWhereUniqueInput
    /**
     * In case the EventoTenant found by the `where` argument doesn't exist, create a new EventoTenant with this data.
     */
    create: XOR<EventoTenantCreateInput, EventoTenantUncheckedCreateInput>
    /**
     * In case the EventoTenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EventoTenantUpdateInput, EventoTenantUncheckedUpdateInput>
  }

  /**
   * EventoTenant delete
   */
  export type EventoTenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoTenant
     */
    select?: EventoTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EventoTenant
     */
    omit?: EventoTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventoTenantInclude<ExtArgs> | null
    /**
     * Filter which EventoTenant to delete.
     */
    where: EventoTenantWhereUniqueInput
  }

  /**
   * EventoTenant deleteMany
   */
  export type EventoTenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EventoTenants to delete
     */
    where?: EventoTenantWhereInput
    /**
     * Limit how many EventoTenants to delete.
     */
    limit?: number
  }

  /**
   * EventoTenant without action
   */
  export type EventoTenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoTenant
     */
    select?: EventoTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EventoTenant
     */
    omit?: EventoTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventoTenantInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TenantScalarFieldEnum: {
    id: 'id',
    slug: 'slug',
    codigo: 'codigo',
    nombre: 'nombre',
    nombreCorto: 'nombreCorto',
    tipoEntidad: 'tipoEntidad',
    nit: 'nit',
    municipio: 'municipio',
    departamento: 'departamento',
    codigoDivipola: 'codigoDivipola',
    dominioPrincipal: 'dominioPrincipal',
    dominioPersonalizado: 'dominioPersonalizado',
    databaseUrl: 'databaseUrl',
    databaseName: 'databaseName',
    plan: 'plan',
    activo: 'activo',
    suspendido: 'suspendido',
    motivoSuspension: 'motivoSuspension',
    fechaActivacion: 'fechaActivacion',
    fechaVencimiento: 'fechaVencimiento',
    modulosActivos: 'modulosActivos',
    emailContacto: 'emailContacto',
    telefonoContacto: 'telefonoContacto',
    nombreContacto: 'nombreContacto',
    logoUrl: 'logoUrl',
    colorPrimario: 'colorPrimario',
    colorSecundario: 'colorSecundario',
    creadoPor: 'creadoPor',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const SuperAdminScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    nombre: 'nombre',
    activo: 'activo',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SuperAdminScalarFieldEnum = (typeof SuperAdminScalarFieldEnum)[keyof typeof SuperAdminScalarFieldEnum]


  export const EventoTenantScalarFieldEnum: {
    id: 'id',
    tipo: 'tipo',
    descripcion: 'descripcion',
    datos: 'datos',
    tenantId: 'tenantId',
    creadoPor: 'creadoPor',
    createdAt: 'createdAt'
  };

  export type EventoTenantScalarFieldEnum = (typeof EventoTenantScalarFieldEnum)[keyof typeof EventoTenantScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'TipoEntidad'
   */
  export type EnumTipoEntidadFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoEntidad'>
    


  /**
   * Reference to a field of type 'TipoEntidad[]'
   */
  export type ListEnumTipoEntidadFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoEntidad[]'>
    


  /**
   * Reference to a field of type 'PlanTenant'
   */
  export type EnumPlanTenantFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlanTenant'>
    


  /**
   * Reference to a field of type 'PlanTenant[]'
   */
  export type ListEnumPlanTenantFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlanTenant[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id?: StringFilter<"Tenant"> | string
    slug?: StringFilter<"Tenant"> | string
    codigo?: StringFilter<"Tenant"> | string
    nombre?: StringFilter<"Tenant"> | string
    nombreCorto?: StringFilter<"Tenant"> | string
    tipoEntidad?: EnumTipoEntidadFilter<"Tenant"> | $Enums.TipoEntidad
    nit?: StringNullableFilter<"Tenant"> | string | null
    municipio?: StringFilter<"Tenant"> | string
    departamento?: StringFilter<"Tenant"> | string
    codigoDivipola?: StringNullableFilter<"Tenant"> | string | null
    dominioPrincipal?: StringFilter<"Tenant"> | string
    dominioPersonalizado?: StringNullableFilter<"Tenant"> | string | null
    databaseUrl?: StringFilter<"Tenant"> | string
    databaseName?: StringFilter<"Tenant"> | string
    plan?: EnumPlanTenantFilter<"Tenant"> | $Enums.PlanTenant
    activo?: BoolFilter<"Tenant"> | boolean
    suspendido?: BoolFilter<"Tenant"> | boolean
    motivoSuspension?: StringNullableFilter<"Tenant"> | string | null
    fechaActivacion?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    fechaVencimiento?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    modulosActivos?: JsonFilter<"Tenant">
    emailContacto?: StringFilter<"Tenant"> | string
    telefonoContacto?: StringNullableFilter<"Tenant"> | string | null
    nombreContacto?: StringNullableFilter<"Tenant"> | string | null
    logoUrl?: StringNullableFilter<"Tenant"> | string | null
    colorPrimario?: StringNullableFilter<"Tenant"> | string | null
    colorSecundario?: StringNullableFilter<"Tenant"> | string | null
    creadoPor?: StringNullableFilter<"Tenant"> | string | null
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    eventos?: EventoTenantListRelationFilter
  }

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder
    slug?: SortOrder
    codigo?: SortOrder
    nombre?: SortOrder
    nombreCorto?: SortOrder
    tipoEntidad?: SortOrder
    nit?: SortOrderInput | SortOrder
    municipio?: SortOrder
    departamento?: SortOrder
    codigoDivipola?: SortOrderInput | SortOrder
    dominioPrincipal?: SortOrder
    dominioPersonalizado?: SortOrderInput | SortOrder
    databaseUrl?: SortOrder
    databaseName?: SortOrder
    plan?: SortOrder
    activo?: SortOrder
    suspendido?: SortOrder
    motivoSuspension?: SortOrderInput | SortOrder
    fechaActivacion?: SortOrderInput | SortOrder
    fechaVencimiento?: SortOrderInput | SortOrder
    modulosActivos?: SortOrder
    emailContacto?: SortOrder
    telefonoContacto?: SortOrderInput | SortOrder
    nombreContacto?: SortOrderInput | SortOrder
    logoUrl?: SortOrderInput | SortOrder
    colorPrimario?: SortOrderInput | SortOrder
    colorSecundario?: SortOrderInput | SortOrder
    creadoPor?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    eventos?: EventoTenantOrderByRelationAggregateInput
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    codigo?: string
    nit?: string
    dominioPrincipal?: string
    dominioPersonalizado?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    nombre?: StringFilter<"Tenant"> | string
    nombreCorto?: StringFilter<"Tenant"> | string
    tipoEntidad?: EnumTipoEntidadFilter<"Tenant"> | $Enums.TipoEntidad
    municipio?: StringFilter<"Tenant"> | string
    departamento?: StringFilter<"Tenant"> | string
    codigoDivipola?: StringNullableFilter<"Tenant"> | string | null
    databaseUrl?: StringFilter<"Tenant"> | string
    databaseName?: StringFilter<"Tenant"> | string
    plan?: EnumPlanTenantFilter<"Tenant"> | $Enums.PlanTenant
    activo?: BoolFilter<"Tenant"> | boolean
    suspendido?: BoolFilter<"Tenant"> | boolean
    motivoSuspension?: StringNullableFilter<"Tenant"> | string | null
    fechaActivacion?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    fechaVencimiento?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    modulosActivos?: JsonFilter<"Tenant">
    emailContacto?: StringFilter<"Tenant"> | string
    telefonoContacto?: StringNullableFilter<"Tenant"> | string | null
    nombreContacto?: StringNullableFilter<"Tenant"> | string | null
    logoUrl?: StringNullableFilter<"Tenant"> | string | null
    colorPrimario?: StringNullableFilter<"Tenant"> | string | null
    colorSecundario?: StringNullableFilter<"Tenant"> | string | null
    creadoPor?: StringNullableFilter<"Tenant"> | string | null
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    eventos?: EventoTenantListRelationFilter
  }, "id" | "slug" | "codigo" | "nit" | "dominioPrincipal" | "dominioPersonalizado">

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder
    slug?: SortOrder
    codigo?: SortOrder
    nombre?: SortOrder
    nombreCorto?: SortOrder
    tipoEntidad?: SortOrder
    nit?: SortOrderInput | SortOrder
    municipio?: SortOrder
    departamento?: SortOrder
    codigoDivipola?: SortOrderInput | SortOrder
    dominioPrincipal?: SortOrder
    dominioPersonalizado?: SortOrderInput | SortOrder
    databaseUrl?: SortOrder
    databaseName?: SortOrder
    plan?: SortOrder
    activo?: SortOrder
    suspendido?: SortOrder
    motivoSuspension?: SortOrderInput | SortOrder
    fechaActivacion?: SortOrderInput | SortOrder
    fechaVencimiento?: SortOrderInput | SortOrder
    modulosActivos?: SortOrder
    emailContacto?: SortOrder
    telefonoContacto?: SortOrderInput | SortOrder
    nombreContacto?: SortOrderInput | SortOrder
    logoUrl?: SortOrderInput | SortOrder
    colorPrimario?: SortOrderInput | SortOrder
    colorSecundario?: SortOrderInput | SortOrder
    creadoPor?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantCountOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tenant"> | string
    slug?: StringWithAggregatesFilter<"Tenant"> | string
    codigo?: StringWithAggregatesFilter<"Tenant"> | string
    nombre?: StringWithAggregatesFilter<"Tenant"> | string
    nombreCorto?: StringWithAggregatesFilter<"Tenant"> | string
    tipoEntidad?: EnumTipoEntidadWithAggregatesFilter<"Tenant"> | $Enums.TipoEntidad
    nit?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    municipio?: StringWithAggregatesFilter<"Tenant"> | string
    departamento?: StringWithAggregatesFilter<"Tenant"> | string
    codigoDivipola?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    dominioPrincipal?: StringWithAggregatesFilter<"Tenant"> | string
    dominioPersonalizado?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    databaseUrl?: StringWithAggregatesFilter<"Tenant"> | string
    databaseName?: StringWithAggregatesFilter<"Tenant"> | string
    plan?: EnumPlanTenantWithAggregatesFilter<"Tenant"> | $Enums.PlanTenant
    activo?: BoolWithAggregatesFilter<"Tenant"> | boolean
    suspendido?: BoolWithAggregatesFilter<"Tenant"> | boolean
    motivoSuspension?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    fechaActivacion?: DateTimeNullableWithAggregatesFilter<"Tenant"> | Date | string | null
    fechaVencimiento?: DateTimeNullableWithAggregatesFilter<"Tenant"> | Date | string | null
    modulosActivos?: JsonWithAggregatesFilter<"Tenant">
    emailContacto?: StringWithAggregatesFilter<"Tenant"> | string
    telefonoContacto?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    nombreContacto?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    logoUrl?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    colorPrimario?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    colorSecundario?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    creadoPor?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
  }

  export type SuperAdminWhereInput = {
    AND?: SuperAdminWhereInput | SuperAdminWhereInput[]
    OR?: SuperAdminWhereInput[]
    NOT?: SuperAdminWhereInput | SuperAdminWhereInput[]
    id?: StringFilter<"SuperAdmin"> | string
    email?: StringFilter<"SuperAdmin"> | string
    password?: StringFilter<"SuperAdmin"> | string
    nombre?: StringFilter<"SuperAdmin"> | string
    activo?: BoolFilter<"SuperAdmin"> | boolean
    createdAt?: DateTimeFilter<"SuperAdmin"> | Date | string
    updatedAt?: DateTimeFilter<"SuperAdmin"> | Date | string
  }

  export type SuperAdminOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    nombre?: SortOrder
    activo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SuperAdminWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: SuperAdminWhereInput | SuperAdminWhereInput[]
    OR?: SuperAdminWhereInput[]
    NOT?: SuperAdminWhereInput | SuperAdminWhereInput[]
    password?: StringFilter<"SuperAdmin"> | string
    nombre?: StringFilter<"SuperAdmin"> | string
    activo?: BoolFilter<"SuperAdmin"> | boolean
    createdAt?: DateTimeFilter<"SuperAdmin"> | Date | string
    updatedAt?: DateTimeFilter<"SuperAdmin"> | Date | string
  }, "id" | "email">

  export type SuperAdminOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    nombre?: SortOrder
    activo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SuperAdminCountOrderByAggregateInput
    _max?: SuperAdminMaxOrderByAggregateInput
    _min?: SuperAdminMinOrderByAggregateInput
  }

  export type SuperAdminScalarWhereWithAggregatesInput = {
    AND?: SuperAdminScalarWhereWithAggregatesInput | SuperAdminScalarWhereWithAggregatesInput[]
    OR?: SuperAdminScalarWhereWithAggregatesInput[]
    NOT?: SuperAdminScalarWhereWithAggregatesInput | SuperAdminScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SuperAdmin"> | string
    email?: StringWithAggregatesFilter<"SuperAdmin"> | string
    password?: StringWithAggregatesFilter<"SuperAdmin"> | string
    nombre?: StringWithAggregatesFilter<"SuperAdmin"> | string
    activo?: BoolWithAggregatesFilter<"SuperAdmin"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"SuperAdmin"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SuperAdmin"> | Date | string
  }

  export type EventoTenantWhereInput = {
    AND?: EventoTenantWhereInput | EventoTenantWhereInput[]
    OR?: EventoTenantWhereInput[]
    NOT?: EventoTenantWhereInput | EventoTenantWhereInput[]
    id?: StringFilter<"EventoTenant"> | string
    tipo?: StringFilter<"EventoTenant"> | string
    descripcion?: StringNullableFilter<"EventoTenant"> | string | null
    datos?: JsonNullableFilter<"EventoTenant">
    tenantId?: StringFilter<"EventoTenant"> | string
    creadoPor?: StringNullableFilter<"EventoTenant"> | string | null
    createdAt?: DateTimeFilter<"EventoTenant"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }

  export type EventoTenantOrderByWithRelationInput = {
    id?: SortOrder
    tipo?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    datos?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    creadoPor?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type EventoTenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: EventoTenantWhereInput | EventoTenantWhereInput[]
    OR?: EventoTenantWhereInput[]
    NOT?: EventoTenantWhereInput | EventoTenantWhereInput[]
    tipo?: StringFilter<"EventoTenant"> | string
    descripcion?: StringNullableFilter<"EventoTenant"> | string | null
    datos?: JsonNullableFilter<"EventoTenant">
    tenantId?: StringFilter<"EventoTenant"> | string
    creadoPor?: StringNullableFilter<"EventoTenant"> | string | null
    createdAt?: DateTimeFilter<"EventoTenant"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }, "id">

  export type EventoTenantOrderByWithAggregationInput = {
    id?: SortOrder
    tipo?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    datos?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    creadoPor?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: EventoTenantCountOrderByAggregateInput
    _max?: EventoTenantMaxOrderByAggregateInput
    _min?: EventoTenantMinOrderByAggregateInput
  }

  export type EventoTenantScalarWhereWithAggregatesInput = {
    AND?: EventoTenantScalarWhereWithAggregatesInput | EventoTenantScalarWhereWithAggregatesInput[]
    OR?: EventoTenantScalarWhereWithAggregatesInput[]
    NOT?: EventoTenantScalarWhereWithAggregatesInput | EventoTenantScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EventoTenant"> | string
    tipo?: StringWithAggregatesFilter<"EventoTenant"> | string
    descripcion?: StringNullableWithAggregatesFilter<"EventoTenant"> | string | null
    datos?: JsonNullableWithAggregatesFilter<"EventoTenant">
    tenantId?: StringWithAggregatesFilter<"EventoTenant"> | string
    creadoPor?: StringNullableWithAggregatesFilter<"EventoTenant"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"EventoTenant"> | Date | string
  }

  export type TenantCreateInput = {
    id?: string
    slug: string
    codigo: string
    nombre: string
    nombreCorto: string
    tipoEntidad: $Enums.TipoEntidad
    nit?: string | null
    municipio: string
    departamento: string
    codigoDivipola?: string | null
    dominioPrincipal: string
    dominioPersonalizado?: string | null
    databaseUrl: string
    databaseName: string
    plan?: $Enums.PlanTenant
    activo?: boolean
    suspendido?: boolean
    motivoSuspension?: string | null
    fechaActivacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    modulosActivos: JsonNullValueInput | InputJsonValue
    emailContacto: string
    telefonoContacto?: string | null
    nombreContacto?: string | null
    logoUrl?: string | null
    colorPrimario?: string | null
    colorSecundario?: string | null
    creadoPor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    eventos?: EventoTenantCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateInput = {
    id?: string
    slug: string
    codigo: string
    nombre: string
    nombreCorto: string
    tipoEntidad: $Enums.TipoEntidad
    nit?: string | null
    municipio: string
    departamento: string
    codigoDivipola?: string | null
    dominioPrincipal: string
    dominioPersonalizado?: string | null
    databaseUrl: string
    databaseName: string
    plan?: $Enums.PlanTenant
    activo?: boolean
    suspendido?: boolean
    motivoSuspension?: string | null
    fechaActivacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    modulosActivos: JsonNullValueInput | InputJsonValue
    emailContacto: string
    telefonoContacto?: string | null
    nombreContacto?: string | null
    logoUrl?: string | null
    colorPrimario?: string | null
    colorSecundario?: string | null
    creadoPor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    eventos?: EventoTenantUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    nombreCorto?: StringFieldUpdateOperationsInput | string
    tipoEntidad?: EnumTipoEntidadFieldUpdateOperationsInput | $Enums.TipoEntidad
    nit?: NullableStringFieldUpdateOperationsInput | string | null
    municipio?: StringFieldUpdateOperationsInput | string
    departamento?: StringFieldUpdateOperationsInput | string
    codigoDivipola?: NullableStringFieldUpdateOperationsInput | string | null
    dominioPrincipal?: StringFieldUpdateOperationsInput | string
    dominioPersonalizado?: NullableStringFieldUpdateOperationsInput | string | null
    databaseUrl?: StringFieldUpdateOperationsInput | string
    databaseName?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTenantFieldUpdateOperationsInput | $Enums.PlanTenant
    activo?: BoolFieldUpdateOperationsInput | boolean
    suspendido?: BoolFieldUpdateOperationsInput | boolean
    motivoSuspension?: NullableStringFieldUpdateOperationsInput | string | null
    fechaActivacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    modulosActivos?: JsonNullValueInput | InputJsonValue
    emailContacto?: StringFieldUpdateOperationsInput | string
    telefonoContacto?: NullableStringFieldUpdateOperationsInput | string | null
    nombreContacto?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    colorPrimario?: NullableStringFieldUpdateOperationsInput | string | null
    colorSecundario?: NullableStringFieldUpdateOperationsInput | string | null
    creadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    eventos?: EventoTenantUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    nombreCorto?: StringFieldUpdateOperationsInput | string
    tipoEntidad?: EnumTipoEntidadFieldUpdateOperationsInput | $Enums.TipoEntidad
    nit?: NullableStringFieldUpdateOperationsInput | string | null
    municipio?: StringFieldUpdateOperationsInput | string
    departamento?: StringFieldUpdateOperationsInput | string
    codigoDivipola?: NullableStringFieldUpdateOperationsInput | string | null
    dominioPrincipal?: StringFieldUpdateOperationsInput | string
    dominioPersonalizado?: NullableStringFieldUpdateOperationsInput | string | null
    databaseUrl?: StringFieldUpdateOperationsInput | string
    databaseName?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTenantFieldUpdateOperationsInput | $Enums.PlanTenant
    activo?: BoolFieldUpdateOperationsInput | boolean
    suspendido?: BoolFieldUpdateOperationsInput | boolean
    motivoSuspension?: NullableStringFieldUpdateOperationsInput | string | null
    fechaActivacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    modulosActivos?: JsonNullValueInput | InputJsonValue
    emailContacto?: StringFieldUpdateOperationsInput | string
    telefonoContacto?: NullableStringFieldUpdateOperationsInput | string | null
    nombreContacto?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    colorPrimario?: NullableStringFieldUpdateOperationsInput | string | null
    colorSecundario?: NullableStringFieldUpdateOperationsInput | string | null
    creadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    eventos?: EventoTenantUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantCreateManyInput = {
    id?: string
    slug: string
    codigo: string
    nombre: string
    nombreCorto: string
    tipoEntidad: $Enums.TipoEntidad
    nit?: string | null
    municipio: string
    departamento: string
    codigoDivipola?: string | null
    dominioPrincipal: string
    dominioPersonalizado?: string | null
    databaseUrl: string
    databaseName: string
    plan?: $Enums.PlanTenant
    activo?: boolean
    suspendido?: boolean
    motivoSuspension?: string | null
    fechaActivacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    modulosActivos: JsonNullValueInput | InputJsonValue
    emailContacto: string
    telefonoContacto?: string | null
    nombreContacto?: string | null
    logoUrl?: string | null
    colorPrimario?: string | null
    colorSecundario?: string | null
    creadoPor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    nombreCorto?: StringFieldUpdateOperationsInput | string
    tipoEntidad?: EnumTipoEntidadFieldUpdateOperationsInput | $Enums.TipoEntidad
    nit?: NullableStringFieldUpdateOperationsInput | string | null
    municipio?: StringFieldUpdateOperationsInput | string
    departamento?: StringFieldUpdateOperationsInput | string
    codigoDivipola?: NullableStringFieldUpdateOperationsInput | string | null
    dominioPrincipal?: StringFieldUpdateOperationsInput | string
    dominioPersonalizado?: NullableStringFieldUpdateOperationsInput | string | null
    databaseUrl?: StringFieldUpdateOperationsInput | string
    databaseName?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTenantFieldUpdateOperationsInput | $Enums.PlanTenant
    activo?: BoolFieldUpdateOperationsInput | boolean
    suspendido?: BoolFieldUpdateOperationsInput | boolean
    motivoSuspension?: NullableStringFieldUpdateOperationsInput | string | null
    fechaActivacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    modulosActivos?: JsonNullValueInput | InputJsonValue
    emailContacto?: StringFieldUpdateOperationsInput | string
    telefonoContacto?: NullableStringFieldUpdateOperationsInput | string | null
    nombreContacto?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    colorPrimario?: NullableStringFieldUpdateOperationsInput | string | null
    colorSecundario?: NullableStringFieldUpdateOperationsInput | string | null
    creadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    nombreCorto?: StringFieldUpdateOperationsInput | string
    tipoEntidad?: EnumTipoEntidadFieldUpdateOperationsInput | $Enums.TipoEntidad
    nit?: NullableStringFieldUpdateOperationsInput | string | null
    municipio?: StringFieldUpdateOperationsInput | string
    departamento?: StringFieldUpdateOperationsInput | string
    codigoDivipola?: NullableStringFieldUpdateOperationsInput | string | null
    dominioPrincipal?: StringFieldUpdateOperationsInput | string
    dominioPersonalizado?: NullableStringFieldUpdateOperationsInput | string | null
    databaseUrl?: StringFieldUpdateOperationsInput | string
    databaseName?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTenantFieldUpdateOperationsInput | $Enums.PlanTenant
    activo?: BoolFieldUpdateOperationsInput | boolean
    suspendido?: BoolFieldUpdateOperationsInput | boolean
    motivoSuspension?: NullableStringFieldUpdateOperationsInput | string | null
    fechaActivacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    modulosActivos?: JsonNullValueInput | InputJsonValue
    emailContacto?: StringFieldUpdateOperationsInput | string
    telefonoContacto?: NullableStringFieldUpdateOperationsInput | string | null
    nombreContacto?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    colorPrimario?: NullableStringFieldUpdateOperationsInput | string | null
    colorSecundario?: NullableStringFieldUpdateOperationsInput | string | null
    creadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminCreateInput = {
    id?: string
    email: string
    password: string
    nombre: string
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SuperAdminUncheckedCreateInput = {
    id?: string
    email: string
    password: string
    nombre: string
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SuperAdminUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminCreateManyInput = {
    id?: string
    email: string
    password: string
    nombre: string
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SuperAdminUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EventoTenantCreateInput = {
    id?: string
    tipo: string
    descripcion?: string | null
    datos?: NullableJsonNullValueInput | InputJsonValue
    creadoPor?: string | null
    createdAt?: Date | string
    tenant: TenantCreateNestedOneWithoutEventosInput
  }

  export type EventoTenantUncheckedCreateInput = {
    id?: string
    tipo: string
    descripcion?: string | null
    datos?: NullableJsonNullValueInput | InputJsonValue
    tenantId: string
    creadoPor?: string | null
    createdAt?: Date | string
  }

  export type EventoTenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    datos?: NullableJsonNullValueInput | InputJsonValue
    creadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutEventosNestedInput
  }

  export type EventoTenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    datos?: NullableJsonNullValueInput | InputJsonValue
    tenantId?: StringFieldUpdateOperationsInput | string
    creadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EventoTenantCreateManyInput = {
    id?: string
    tipo: string
    descripcion?: string | null
    datos?: NullableJsonNullValueInput | InputJsonValue
    tenantId: string
    creadoPor?: string | null
    createdAt?: Date | string
  }

  export type EventoTenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    datos?: NullableJsonNullValueInput | InputJsonValue
    creadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EventoTenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    datos?: NullableJsonNullValueInput | InputJsonValue
    tenantId?: StringFieldUpdateOperationsInput | string
    creadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumTipoEntidadFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoEntidad | EnumTipoEntidadFieldRefInput<$PrismaModel>
    in?: $Enums.TipoEntidad[] | ListEnumTipoEntidadFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoEntidad[] | ListEnumTipoEntidadFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoEntidadFilter<$PrismaModel> | $Enums.TipoEntidad
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumPlanTenantFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanTenant | EnumPlanTenantFieldRefInput<$PrismaModel>
    in?: $Enums.PlanTenant[] | ListEnumPlanTenantFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanTenant[] | ListEnumPlanTenantFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanTenantFilter<$PrismaModel> | $Enums.PlanTenant
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type EventoTenantListRelationFilter = {
    every?: EventoTenantWhereInput
    some?: EventoTenantWhereInput
    none?: EventoTenantWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type EventoTenantOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    codigo?: SortOrder
    nombre?: SortOrder
    nombreCorto?: SortOrder
    tipoEntidad?: SortOrder
    nit?: SortOrder
    municipio?: SortOrder
    departamento?: SortOrder
    codigoDivipola?: SortOrder
    dominioPrincipal?: SortOrder
    dominioPersonalizado?: SortOrder
    databaseUrl?: SortOrder
    databaseName?: SortOrder
    plan?: SortOrder
    activo?: SortOrder
    suspendido?: SortOrder
    motivoSuspension?: SortOrder
    fechaActivacion?: SortOrder
    fechaVencimiento?: SortOrder
    modulosActivos?: SortOrder
    emailContacto?: SortOrder
    telefonoContacto?: SortOrder
    nombreContacto?: SortOrder
    logoUrl?: SortOrder
    colorPrimario?: SortOrder
    colorSecundario?: SortOrder
    creadoPor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    codigo?: SortOrder
    nombre?: SortOrder
    nombreCorto?: SortOrder
    tipoEntidad?: SortOrder
    nit?: SortOrder
    municipio?: SortOrder
    departamento?: SortOrder
    codigoDivipola?: SortOrder
    dominioPrincipal?: SortOrder
    dominioPersonalizado?: SortOrder
    databaseUrl?: SortOrder
    databaseName?: SortOrder
    plan?: SortOrder
    activo?: SortOrder
    suspendido?: SortOrder
    motivoSuspension?: SortOrder
    fechaActivacion?: SortOrder
    fechaVencimiento?: SortOrder
    emailContacto?: SortOrder
    telefonoContacto?: SortOrder
    nombreContacto?: SortOrder
    logoUrl?: SortOrder
    colorPrimario?: SortOrder
    colorSecundario?: SortOrder
    creadoPor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    codigo?: SortOrder
    nombre?: SortOrder
    nombreCorto?: SortOrder
    tipoEntidad?: SortOrder
    nit?: SortOrder
    municipio?: SortOrder
    departamento?: SortOrder
    codigoDivipola?: SortOrder
    dominioPrincipal?: SortOrder
    dominioPersonalizado?: SortOrder
    databaseUrl?: SortOrder
    databaseName?: SortOrder
    plan?: SortOrder
    activo?: SortOrder
    suspendido?: SortOrder
    motivoSuspension?: SortOrder
    fechaActivacion?: SortOrder
    fechaVencimiento?: SortOrder
    emailContacto?: SortOrder
    telefonoContacto?: SortOrder
    nombreContacto?: SortOrder
    logoUrl?: SortOrder
    colorPrimario?: SortOrder
    colorSecundario?: SortOrder
    creadoPor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumTipoEntidadWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoEntidad | EnumTipoEntidadFieldRefInput<$PrismaModel>
    in?: $Enums.TipoEntidad[] | ListEnumTipoEntidadFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoEntidad[] | ListEnumTipoEntidadFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoEntidadWithAggregatesFilter<$PrismaModel> | $Enums.TipoEntidad
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoEntidadFilter<$PrismaModel>
    _max?: NestedEnumTipoEntidadFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumPlanTenantWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanTenant | EnumPlanTenantFieldRefInput<$PrismaModel>
    in?: $Enums.PlanTenant[] | ListEnumPlanTenantFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanTenant[] | ListEnumPlanTenantFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanTenantWithAggregatesFilter<$PrismaModel> | $Enums.PlanTenant
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlanTenantFilter<$PrismaModel>
    _max?: NestedEnumPlanTenantFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type SuperAdminCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    nombre?: SortOrder
    activo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SuperAdminMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    nombre?: SortOrder
    activo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SuperAdminMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    nombre?: SortOrder
    activo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type TenantScalarRelationFilter = {
    is?: TenantWhereInput
    isNot?: TenantWhereInput
  }

  export type EventoTenantCountOrderByAggregateInput = {
    id?: SortOrder
    tipo?: SortOrder
    descripcion?: SortOrder
    datos?: SortOrder
    tenantId?: SortOrder
    creadoPor?: SortOrder
    createdAt?: SortOrder
  }

  export type EventoTenantMaxOrderByAggregateInput = {
    id?: SortOrder
    tipo?: SortOrder
    descripcion?: SortOrder
    tenantId?: SortOrder
    creadoPor?: SortOrder
    createdAt?: SortOrder
  }

  export type EventoTenantMinOrderByAggregateInput = {
    id?: SortOrder
    tipo?: SortOrder
    descripcion?: SortOrder
    tenantId?: SortOrder
    creadoPor?: SortOrder
    createdAt?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EventoTenantCreateNestedManyWithoutTenantInput = {
    create?: XOR<EventoTenantCreateWithoutTenantInput, EventoTenantUncheckedCreateWithoutTenantInput> | EventoTenantCreateWithoutTenantInput[] | EventoTenantUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: EventoTenantCreateOrConnectWithoutTenantInput | EventoTenantCreateOrConnectWithoutTenantInput[]
    createMany?: EventoTenantCreateManyTenantInputEnvelope
    connect?: EventoTenantWhereUniqueInput | EventoTenantWhereUniqueInput[]
  }

  export type EventoTenantUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<EventoTenantCreateWithoutTenantInput, EventoTenantUncheckedCreateWithoutTenantInput> | EventoTenantCreateWithoutTenantInput[] | EventoTenantUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: EventoTenantCreateOrConnectWithoutTenantInput | EventoTenantCreateOrConnectWithoutTenantInput[]
    createMany?: EventoTenantCreateManyTenantInputEnvelope
    connect?: EventoTenantWhereUniqueInput | EventoTenantWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumTipoEntidadFieldUpdateOperationsInput = {
    set?: $Enums.TipoEntidad
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumPlanTenantFieldUpdateOperationsInput = {
    set?: $Enums.PlanTenant
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type EventoTenantUpdateManyWithoutTenantNestedInput = {
    create?: XOR<EventoTenantCreateWithoutTenantInput, EventoTenantUncheckedCreateWithoutTenantInput> | EventoTenantCreateWithoutTenantInput[] | EventoTenantUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: EventoTenantCreateOrConnectWithoutTenantInput | EventoTenantCreateOrConnectWithoutTenantInput[]
    upsert?: EventoTenantUpsertWithWhereUniqueWithoutTenantInput | EventoTenantUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: EventoTenantCreateManyTenantInputEnvelope
    set?: EventoTenantWhereUniqueInput | EventoTenantWhereUniqueInput[]
    disconnect?: EventoTenantWhereUniqueInput | EventoTenantWhereUniqueInput[]
    delete?: EventoTenantWhereUniqueInput | EventoTenantWhereUniqueInput[]
    connect?: EventoTenantWhereUniqueInput | EventoTenantWhereUniqueInput[]
    update?: EventoTenantUpdateWithWhereUniqueWithoutTenantInput | EventoTenantUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: EventoTenantUpdateManyWithWhereWithoutTenantInput | EventoTenantUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: EventoTenantScalarWhereInput | EventoTenantScalarWhereInput[]
  }

  export type EventoTenantUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<EventoTenantCreateWithoutTenantInput, EventoTenantUncheckedCreateWithoutTenantInput> | EventoTenantCreateWithoutTenantInput[] | EventoTenantUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: EventoTenantCreateOrConnectWithoutTenantInput | EventoTenantCreateOrConnectWithoutTenantInput[]
    upsert?: EventoTenantUpsertWithWhereUniqueWithoutTenantInput | EventoTenantUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: EventoTenantCreateManyTenantInputEnvelope
    set?: EventoTenantWhereUniqueInput | EventoTenantWhereUniqueInput[]
    disconnect?: EventoTenantWhereUniqueInput | EventoTenantWhereUniqueInput[]
    delete?: EventoTenantWhereUniqueInput | EventoTenantWhereUniqueInput[]
    connect?: EventoTenantWhereUniqueInput | EventoTenantWhereUniqueInput[]
    update?: EventoTenantUpdateWithWhereUniqueWithoutTenantInput | EventoTenantUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: EventoTenantUpdateManyWithWhereWithoutTenantInput | EventoTenantUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: EventoTenantScalarWhereInput | EventoTenantScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutEventosInput = {
    create?: XOR<TenantCreateWithoutEventosInput, TenantUncheckedCreateWithoutEventosInput>
    connectOrCreate?: TenantCreateOrConnectWithoutEventosInput
    connect?: TenantWhereUniqueInput
  }

  export type TenantUpdateOneRequiredWithoutEventosNestedInput = {
    create?: XOR<TenantCreateWithoutEventosInput, TenantUncheckedCreateWithoutEventosInput>
    connectOrCreate?: TenantCreateOrConnectWithoutEventosInput
    upsert?: TenantUpsertWithoutEventosInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutEventosInput, TenantUpdateWithoutEventosInput>, TenantUncheckedUpdateWithoutEventosInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumTipoEntidadFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoEntidad | EnumTipoEntidadFieldRefInput<$PrismaModel>
    in?: $Enums.TipoEntidad[] | ListEnumTipoEntidadFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoEntidad[] | ListEnumTipoEntidadFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoEntidadFilter<$PrismaModel> | $Enums.TipoEntidad
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumPlanTenantFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanTenant | EnumPlanTenantFieldRefInput<$PrismaModel>
    in?: $Enums.PlanTenant[] | ListEnumPlanTenantFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanTenant[] | ListEnumPlanTenantFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanTenantFilter<$PrismaModel> | $Enums.PlanTenant
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumTipoEntidadWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoEntidad | EnumTipoEntidadFieldRefInput<$PrismaModel>
    in?: $Enums.TipoEntidad[] | ListEnumTipoEntidadFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoEntidad[] | ListEnumTipoEntidadFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoEntidadWithAggregatesFilter<$PrismaModel> | $Enums.TipoEntidad
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoEntidadFilter<$PrismaModel>
    _max?: NestedEnumTipoEntidadFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumPlanTenantWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanTenant | EnumPlanTenantFieldRefInput<$PrismaModel>
    in?: $Enums.PlanTenant[] | ListEnumPlanTenantFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanTenant[] | ListEnumPlanTenantFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanTenantWithAggregatesFilter<$PrismaModel> | $Enums.PlanTenant
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlanTenantFilter<$PrismaModel>
    _max?: NestedEnumPlanTenantFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type EventoTenantCreateWithoutTenantInput = {
    id?: string
    tipo: string
    descripcion?: string | null
    datos?: NullableJsonNullValueInput | InputJsonValue
    creadoPor?: string | null
    createdAt?: Date | string
  }

  export type EventoTenantUncheckedCreateWithoutTenantInput = {
    id?: string
    tipo: string
    descripcion?: string | null
    datos?: NullableJsonNullValueInput | InputJsonValue
    creadoPor?: string | null
    createdAt?: Date | string
  }

  export type EventoTenantCreateOrConnectWithoutTenantInput = {
    where: EventoTenantWhereUniqueInput
    create: XOR<EventoTenantCreateWithoutTenantInput, EventoTenantUncheckedCreateWithoutTenantInput>
  }

  export type EventoTenantCreateManyTenantInputEnvelope = {
    data: EventoTenantCreateManyTenantInput | EventoTenantCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type EventoTenantUpsertWithWhereUniqueWithoutTenantInput = {
    where: EventoTenantWhereUniqueInput
    update: XOR<EventoTenantUpdateWithoutTenantInput, EventoTenantUncheckedUpdateWithoutTenantInput>
    create: XOR<EventoTenantCreateWithoutTenantInput, EventoTenantUncheckedCreateWithoutTenantInput>
  }

  export type EventoTenantUpdateWithWhereUniqueWithoutTenantInput = {
    where: EventoTenantWhereUniqueInput
    data: XOR<EventoTenantUpdateWithoutTenantInput, EventoTenantUncheckedUpdateWithoutTenantInput>
  }

  export type EventoTenantUpdateManyWithWhereWithoutTenantInput = {
    where: EventoTenantScalarWhereInput
    data: XOR<EventoTenantUpdateManyMutationInput, EventoTenantUncheckedUpdateManyWithoutTenantInput>
  }

  export type EventoTenantScalarWhereInput = {
    AND?: EventoTenantScalarWhereInput | EventoTenantScalarWhereInput[]
    OR?: EventoTenantScalarWhereInput[]
    NOT?: EventoTenantScalarWhereInput | EventoTenantScalarWhereInput[]
    id?: StringFilter<"EventoTenant"> | string
    tipo?: StringFilter<"EventoTenant"> | string
    descripcion?: StringNullableFilter<"EventoTenant"> | string | null
    datos?: JsonNullableFilter<"EventoTenant">
    tenantId?: StringFilter<"EventoTenant"> | string
    creadoPor?: StringNullableFilter<"EventoTenant"> | string | null
    createdAt?: DateTimeFilter<"EventoTenant"> | Date | string
  }

  export type TenantCreateWithoutEventosInput = {
    id?: string
    slug: string
    codigo: string
    nombre: string
    nombreCorto: string
    tipoEntidad: $Enums.TipoEntidad
    nit?: string | null
    municipio: string
    departamento: string
    codigoDivipola?: string | null
    dominioPrincipal: string
    dominioPersonalizado?: string | null
    databaseUrl: string
    databaseName: string
    plan?: $Enums.PlanTenant
    activo?: boolean
    suspendido?: boolean
    motivoSuspension?: string | null
    fechaActivacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    modulosActivos: JsonNullValueInput | InputJsonValue
    emailContacto: string
    telefonoContacto?: string | null
    nombreContacto?: string | null
    logoUrl?: string | null
    colorPrimario?: string | null
    colorSecundario?: string | null
    creadoPor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUncheckedCreateWithoutEventosInput = {
    id?: string
    slug: string
    codigo: string
    nombre: string
    nombreCorto: string
    tipoEntidad: $Enums.TipoEntidad
    nit?: string | null
    municipio: string
    departamento: string
    codigoDivipola?: string | null
    dominioPrincipal: string
    dominioPersonalizado?: string | null
    databaseUrl: string
    databaseName: string
    plan?: $Enums.PlanTenant
    activo?: boolean
    suspendido?: boolean
    motivoSuspension?: string | null
    fechaActivacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    modulosActivos: JsonNullValueInput | InputJsonValue
    emailContacto: string
    telefonoContacto?: string | null
    nombreContacto?: string | null
    logoUrl?: string | null
    colorPrimario?: string | null
    colorSecundario?: string | null
    creadoPor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantCreateOrConnectWithoutEventosInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutEventosInput, TenantUncheckedCreateWithoutEventosInput>
  }

  export type TenantUpsertWithoutEventosInput = {
    update: XOR<TenantUpdateWithoutEventosInput, TenantUncheckedUpdateWithoutEventosInput>
    create: XOR<TenantCreateWithoutEventosInput, TenantUncheckedCreateWithoutEventosInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutEventosInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutEventosInput, TenantUncheckedUpdateWithoutEventosInput>
  }

  export type TenantUpdateWithoutEventosInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    nombreCorto?: StringFieldUpdateOperationsInput | string
    tipoEntidad?: EnumTipoEntidadFieldUpdateOperationsInput | $Enums.TipoEntidad
    nit?: NullableStringFieldUpdateOperationsInput | string | null
    municipio?: StringFieldUpdateOperationsInput | string
    departamento?: StringFieldUpdateOperationsInput | string
    codigoDivipola?: NullableStringFieldUpdateOperationsInput | string | null
    dominioPrincipal?: StringFieldUpdateOperationsInput | string
    dominioPersonalizado?: NullableStringFieldUpdateOperationsInput | string | null
    databaseUrl?: StringFieldUpdateOperationsInput | string
    databaseName?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTenantFieldUpdateOperationsInput | $Enums.PlanTenant
    activo?: BoolFieldUpdateOperationsInput | boolean
    suspendido?: BoolFieldUpdateOperationsInput | boolean
    motivoSuspension?: NullableStringFieldUpdateOperationsInput | string | null
    fechaActivacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    modulosActivos?: JsonNullValueInput | InputJsonValue
    emailContacto?: StringFieldUpdateOperationsInput | string
    telefonoContacto?: NullableStringFieldUpdateOperationsInput | string | null
    nombreContacto?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    colorPrimario?: NullableStringFieldUpdateOperationsInput | string | null
    colorSecundario?: NullableStringFieldUpdateOperationsInput | string | null
    creadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateWithoutEventosInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    nombreCorto?: StringFieldUpdateOperationsInput | string
    tipoEntidad?: EnumTipoEntidadFieldUpdateOperationsInput | $Enums.TipoEntidad
    nit?: NullableStringFieldUpdateOperationsInput | string | null
    municipio?: StringFieldUpdateOperationsInput | string
    departamento?: StringFieldUpdateOperationsInput | string
    codigoDivipola?: NullableStringFieldUpdateOperationsInput | string | null
    dominioPrincipal?: StringFieldUpdateOperationsInput | string
    dominioPersonalizado?: NullableStringFieldUpdateOperationsInput | string | null
    databaseUrl?: StringFieldUpdateOperationsInput | string
    databaseName?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTenantFieldUpdateOperationsInput | $Enums.PlanTenant
    activo?: BoolFieldUpdateOperationsInput | boolean
    suspendido?: BoolFieldUpdateOperationsInput | boolean
    motivoSuspension?: NullableStringFieldUpdateOperationsInput | string | null
    fechaActivacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    modulosActivos?: JsonNullValueInput | InputJsonValue
    emailContacto?: StringFieldUpdateOperationsInput | string
    telefonoContacto?: NullableStringFieldUpdateOperationsInput | string | null
    nombreContacto?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    colorPrimario?: NullableStringFieldUpdateOperationsInput | string | null
    colorSecundario?: NullableStringFieldUpdateOperationsInput | string | null
    creadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EventoTenantCreateManyTenantInput = {
    id?: string
    tipo: string
    descripcion?: string | null
    datos?: NullableJsonNullValueInput | InputJsonValue
    creadoPor?: string | null
    createdAt?: Date | string
  }

  export type EventoTenantUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    datos?: NullableJsonNullValueInput | InputJsonValue
    creadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EventoTenantUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    datos?: NullableJsonNullValueInput | InputJsonValue
    creadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EventoTenantUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    datos?: NullableJsonNullValueInput | InputJsonValue
    creadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}