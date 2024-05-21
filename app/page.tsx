"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { testData } from "./data";

type Customer = {
  name: string;
  email: string;
};

type Item = {
  name: string;
  price: string;
  sku: string;
};

export type Order = {
  created_at: string;
  customer: Customer;
  items: Item[];
  id: string;
};

const handleErrorMessage = (error: any, defaultError: string) => {
  if (error.message) {
    return error.message;
  } else {
    return defaultError;
  }
};

const formatCurrencyGDP = (value: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
};

const averageOrderValue = (orders: Order[]) => {
  const allOrderValues: number[] = [];

  orders.map((order) => {
    const total = order.items.reduce((accumulatedValue, item) => {
      return accumulatedValue + Number(item.price);
    }, 0);

    allOrderValues.push(total);
  });

  const totalValue = allOrderValues.reduce((accumulatedValue, value) => {
    return accumulatedValue + value;
  }, 0);

  return totalValue / orders.length;
};

const HomePage = (): React.ReactElement => {
  const [getOrders, setGetOrders] = useState(false);

  const { data, refetch, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: ["getOrders"],
    queryFn: async () => {
      const response = await axios.get(
        "https://fauxdata.codelayer.io/api/orders"
      );
      return response.data;
    },
    enabled: getOrders,
    retry: 2,
  });

  return (
    <div className="flex flex-col gap-8">
      <h1>Average Order Value</h1>

      <div className="flex flex-col gap-3">
        <h2>Query Data:</h2>

        <p>
          Unfortunatly there is a CORS policy in place on the endpoint so this
          query a use of state from tanstack is just for show
        </p>

        <div>
          <button
            className="bg-slate-500 hover:bg-slate-400 rounded-lg px-2"
            onClick={() => {
              getOrders ? refetch() : setGetOrders(true);
            }}
          >
            Show Query Average Order Value
          </button>
        </div>

        {isLoading && <p>Loading...</p>}

        {isError && (
          <p>
            {handleErrorMessage(
              error,
              "An error occurred when fetching orders, please try again"
            )}
          </p>
        )}

        {isSuccess && (
          <p>{formatCurrencyGDP(averageOrderValue(data as Order[]))}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2>Test Data:</h2>

        <p>{formatCurrencyGDP(averageOrderValue(testData))}</p>
      </div>
    </div>
  );
};

export default HomePage;
