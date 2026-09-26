interface User {
  name: string;
  age: number;
}

function printUser(user: User): void {
  console.log(`Name: ${user.name}`);
  console.log(`Age: ${user.age}`);
}

const user: User = {
  name: "Sandesh",
  age: 25,
};

printUser(user);