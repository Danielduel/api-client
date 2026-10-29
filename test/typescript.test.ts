import { describe, test } from "node:test";
import { strict as assert } from "node:assert";

describe("I got lost in types and I have to regain my sanity", () => {
  test("minimal concept", () => {
    class TypedMonad1<T = undefined> {
      value: T;

      constructor(value: T) {
        this.value = value;
      }

      get(): T {
        return this.value;
      }

      set<V>(v: V): TypedMonad1<V> {
        return new TypedMonad1(v);
      }
    }

    const typedMonad1_1 = new TypedMonad1(undefined);
    typedMonad1_1.get()

    const typedMonad1_2 = typedMonad1_1.set(1).get();
    // number
  });

  test("developing concept - pass builder values to built", () => {
    class MonadType<
      Value1 = undefined,
      Value2 = undefined,
    > {
      constructor(
        public value1: Value1,
        public value2: Value2,
      ) { }
    }

    class DevelopingMonadType<
      Value1 = undefined,
      Value2 = undefined,
    > {
      constructor(
        public value1: Value1,
        public value2: Value2,
      ) { }

      setValue1<NewValue1>(v: NewValue1): DevelopingMonadType<NewValue1, Value2> { return new DevelopingMonadType(v, this.value2); }
      setValue2<NewValue2>(v: NewValue2): DevelopingMonadType<Value1, NewValue2> { return new DevelopingMonadType(this.value1, v); }

      build(): MonadType<Value1, Value2> { return new MonadType(this.value1, this.value2); }
    }

    const builtObject = new DevelopingMonadType(undefined, undefined) // I really dislike that I have to provide undefineds
      .setValue1(() => "hello")
      .setValue2(12)
      .build();

    builtObject.value1();
  })

  test("developing concept - expose builder values that are callable", () => {
    function typeyeetNonFunction<T>(x: T): T extends CallableFunction ? T : never {
      if (typeof x === "function") {
        return x as T extends CallableFunction ? T : never;
      }
      return undefined as never;
    }

    class MonadType<
      Value1 = undefined,
      Value2 = undefined,
    > {
      constructor(
        private _value1: Value1,
        private _value2: Value2,
        public value1: Value1 extends CallableFunction ? Value1 : never = typeyeetNonFunction(this._value1),
        public value2: Value2 extends CallableFunction ? Value2 : never = typeyeetNonFunction(this._value2),
      ) { }
    }

    class DevelopingMonadType<
      Value1 = undefined,
      Value2 = undefined,
    > {
      constructor(
        public value1: Value1,
        public value2: Value2,
      ) { }

      setValue1<NewValue1>(v: NewValue1): DevelopingMonadType<NewValue1, Value2> { return new DevelopingMonadType(v, this.value2); }
      setValue2<NewValue2>(v: NewValue2): DevelopingMonadType<Value1, NewValue2> { return new DevelopingMonadType(this.value1, v); }

      build(): MonadType<Value1, Value2> { return new MonadType(this.value1, this.value2); }
    }

    const builtObjectCallable1 = new DevelopingMonadType(undefined, undefined) // I really dislike that I have to provide undefineds
      .setValue1(() => "hello")
      .setValue2(12)
      .build();

    builtObjectCallable1.value1();
    builtObjectCallable1.value2();

    const builtObjectCallable2 = new DevelopingMonadType(undefined, undefined) // I really dislike that I have to provide undefineds
      .setValue2(() => "something")
      .build();

    builtObjectCallable2.value1();
    builtObjectCallable2.value2();
  })
})
