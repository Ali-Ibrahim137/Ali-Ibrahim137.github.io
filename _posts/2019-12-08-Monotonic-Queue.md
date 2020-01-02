---
layout: post
title:  "Monotonic Queue"
date:   2019-12-08
categories: Competitive Programming
---
## Motivation Problem
Given $$n \times m$$ matrix $$(1 \le n, m \le 3*10^3)$$ you have to calculate the sum of minimum numbers in all sub-matrices of size $$a\times b$$ with top left corners in $$(i, j)$$ over all $$1 \le i \le n-a+1$$ and $$1 \le j \le m-b+1$$.

Problem is available at Codeforces [here](https://codeforces.com/contest/1195/problem/E).

Test Sample:

$$n = 2, m = 4, a = 2, b = 2$$

$$  
\begin{matrix}  
\textbf1 & 3 & \textbf2 & 6 \\  
5 & 4 & 8 & \textbf1
\end{matrix}
$$

Answer is : $$1 + 2 + 1 = 4$$

To solve the problem, let's first solve a simpler version, and show how to use the simple version efficient solution to solve this problem.


### Simpler problem
Given an array of $$n$$  numbers $$(1 \le n \le 10^5)$$ you have to calculate the sum of the minimum numbers in all sub-arrays of length $$k$$ starting at index $$i$$ over all $$1\le i \le n-k+1$$.

Test Sample:

$$n = 6, k = 3$$

$$a = [5, \textbf3, \textbf4, 4, 5, \textbf1]$$

Answer is : $$3 + 3 + 4 + 1 = 11$$


#### Brute Force Solution
The naive brute force solution for this problem is by just iterating over all sub-arrays of length $$k$$ and adding the minimum value to the answer, the code will look something like this:

    for(int i=1;i+k<=n;i++){
	    int mn = a[i];
	    for(int j=0;j<k;j++){
		mn = min(mn, a[i+j]);
	    }
	    answer+=mn;
	}

  This solution will get the ***Time Limit Exceeded*** verdict. As the complexity is $$O(n$$ $$k)$$. We have to look for something more efficient.

#### Segment Tree Solution
  We can use segment tree to solve this problem, we store at every node in the tree the minimum value in range, and implement $$query(l, r)$$ function to find the minimum value in the interval $$(l, r)$$. This reduces the complexity to $$O(n$$ $$logn)$$. The code will look something like this:

```
for(int i=1;i+k<=n;i++){
      int mn = query(i, i+k);
      answer+=mn;
}
```

  The time needed to build the tree in $$O(n)$$ and we find the answer for each query in $$O(logn)$$ time.

  We can also find the answer for every query in $$O(1)$$ if we use sparse table, however the overall complexity remains the same, as building sparse table is $$O(n$$ $$logn)$$.

  $$O(n$$ $$logn)$$ will get an accepted verdict for sure, but we can still solve the problem in just $$O(n)$$ using monotonic queue.

## Monotonic Queue
Monotonic Queue is a data structure where the numbers in it are ***strictly*** increasing or decreasing. an example of a strictly increasing monotonic queue will be: $$[1, 3, 5, 8]$$.

Monotonic Queue should support ***add*** and ***delete*** operations, from ***both*** sides left and right. The best way to implement it in C++ is by using  `std::deque`.

To solve this problem, we should use a strictly increasing monotonic queue. First we add the first $$k$$ numbers, and then do a sliding window for the rest $$n-k$$ numbers.

Let's take the sample test as an example to see how the monotonic queue changes:

|index   | $$a_i$$  | queue  | change  |
|---|---|---|---|
|  1 | 5  |$$[5]$$   |added $$(5)$$   |
|  2 | 3  |$$[3]$$   |deleted $$(5)$$, added $$(3)$$   |
|  3 | 4  |$$[3, 4]$$   |added $$(4)$$   |
|  4 | 4  |$$[3, 4]$$   |deleted $$(4)$$, added $$(4)$$   |
|  5 | 5  |$$[4, 5]$$   |deleted $$(3)$$, added $$(5)$$   |
|  6 | 1  |$$[1]$$   |deleted $$(4, 5)$$, added $$(1)$$   |

The main observation is that we can always get the minimum number by just looking at the front of the queue, and the size of the queue wont exceed $$k$$.

The code for the problem will look something like this:

    deque<pair<int, int> >dq;
    void add(int val, int idx){
	    // adds a number to the back of the queue
	    while(!dq.empty() && dq.back().first>=val){
	        dq.pop_back();
	    }
	    dq.push_back({val, idx});
    }
    void del(int idx){
	    // delets a number from the front of the queue
	    if(!dq.empty() && dq.front().second==idx)dq.pop_front();
	}
	int solve(){
	    int answer = 0;
	    // add the first k numbers
	    for(int i=1;i<=k;i++){
	        add(a[i], i);
	    }
	    answer+=dq.front().first;
        // make a sliding window for the rest n-k numbers
	    for(int i=k+1;i<=n;i++){
	        del(i-k);
	        add(a[i], i);
	        answer+=dq.front().first;
	    }
	    return answer;
	}

Monotonic Queue can find the solution for the problem in $$O(n)$$ as for every number we are just adding it once, and deleting it once.


### Back to the original problem
We can solve the original problem also using monotonic queue, the idea is we first use monotonic queue to find the answer for each row, this reduces the size of the input array to $$n \times (m-b+1)$$. Next we use monotonic queue to find the answer for each of the resulting $$m-b+1$$ columns. This reduces the size of the array to $$(n-a+1) \times (m-b+1)$$. Every number is the minimum value in its sub-matrices, and we just have to sum up these numbers to find the solution.

### Practice Problems
 - [Monitor](https://codeforces.com/contest/846/problem/E).


 # Conclusion
 In this article we started by giving a motivation problem, discussed different solutions to the problem and started to improve the solution, we ended up by talking about monotonic queue and how to use it to solve the problem.

 The code for this problem is available [here](link%20is%20to%20be%20added).

 I hope you liked this article, please stay tuned for more.
