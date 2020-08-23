---
layout: post
title:  "Stress Testing"
date:   2020-08-23
categories: Competitive programming
---
I decided to write this article after watching the last screencast made by [Errichto](https://codeforces.com/profile/Errichto). To be more precise when he started making stress testing to find counter-test you can check that [here](https://www.youtube.com/watch?v=uABbBGtEWks&feature=youtu.be&t=1433). Errichto has a full video called [How to test your solution in Competitive Programming, on Linux?](https://www.youtube.com/watch?v=JXTVOyQpSGM) I highly recommend you to check it, basically this article is the same but I am extending it to stress test solutions with multiple answers using a written checker, so let's jump in.

## Introduction
You can use stress testing in competitive programming to test your solution against many randomly generated tests in order to find a "small" test case that your solution produces wrong answer for this case, and hopefully this can help you to find the bug in your code of the mistake in your approach and eventually helping you solve the problem.

## Before starting
I think before starting with stress testing it would be good to have some knowledge about how problems are prepared, and how the process goes on, I will briefly talk about this and the purpose of every program you should write, I think this might help you understand whats coming next.

- **Generator:** It's a program you should write to *generate* your test cases, for most problems it's almost impossible to write tests manually, as the constraints might be very high (like an array on $$10^5$$ numbers) That's where generators come to the rescue.

- **Validator:** It's a program you should write to *validate* whether your generated tests are correct, for example if your input is a single prime number $$p$$ such that $$2\le p \le 10^6$$ then the validator must check than $$p$$ is in the given range, also it must check that $$p$$ is a prime number.

- **Solution(s):** Every problem must have different solutions to handle different complexities and to ensure that wrong solutions will fail the tests(like using greedy solution in dp problem), one of this solutions will be the main correct solution.

- **Checker:** It's a program you should write to *check* if the solution is correct, some problems might have only one correct answer (like the following problem: count the number of prime numbers between $$a$$ and $$b$$) or multiple correct answers (like the following problem: print any prime number between $$a$$ and $$b$$).

All these programs work together in the following order, first the generator generates test cases, the validator receives these test cases and *validates* them, if the tests meet the constraints and the test is valid then the solution receives these tests and runs them, producing output files, finally the checker *checks* these output files and gives the final verdict. Simple isn't it? (Remember to add image).

## What do you need to run Stress Tests?
To run stress tests you should have the code to test (the code giving WA), also you should write ***brute force*** solution, this solution usually is very slow but you are 100% sure it gives the right solution, in addition you need to write the tests generator to generate tests, you will need a checker if the problem can have multiple correct answers, but if the answer is unique we can just use `diff` function in Linux Operating system. We usually skip the validator, if we are sure our tests are correct.

## Example Problem
Let's take this [problem](https://codeforces.com/contest/4/problem/A) as an example. You probably know it, it's Watermelon from Codeforces Beta Round #4 the problem says you are given a watermelon of weight $$w$$ and you should divide it into two parts of **even** weight and it's not obligatory that the parts are equal. Let's say you have written this code:

{% highlight cpp linenos %}
#include <bits/stdc++.h>
using namespace std;

int main() {
    int w;
    cin>>w;
    if(w%2==0)cout<<"YES"<<endl;
    else cout<<"NO"<<endl;
}

{% endhighlight %}
---

After submitting the code you get the verdict of WA on test 5, the brute force solution for this problem will be something like this:

{% highlight cpp linenos %}
#include <bits/stdc++.h>
using namespace std;
int main() {
    int w;
    cin>>w;
    for(int i=1;i<w;i++){
        int j = w - i;
        if(i%2==0 && j%2==0){
            cout<<"YES"<<endl;
            return 0;
        }
    }
    cout<<"NO"<<endl;
}
{% endhighlight %}
---

Also the generator will look like this:
{% highlight cpp linenos %}
#include <bits/stdc++.h>
using namespace std;
int rnd(int a, int b){
    return a + rand() % (b - a + 1);
}
int main() {
    int w = rnd(1, 100);
    cout<<w<<endl;
}
{% endhighlight %}
---

## Putting things together (bad implementation)
When I started doing stress testing I was using this bad implementation, instead of writing different programs and making them work together, I used to write these programs as **Functions** in the same code, and keep calling this functions, for the previous problem I would have written this kind of code:

{% highlight cpp linenos %}
#include <bits/stdc++.h>
using namespace std;

int rnd(int a, int b){
    return a + rand() % (b - a + 1);
}
int generator(){
    // This function acts as a generator.
    int w = rnd(1, 100);
    return w;
}
string solve(int w){
    // This function acts as the WA solution to test.
    if(w%2==0)return "YES";
    return "NO";
}

string bruteForce(int w){
    // This function acts as the brute force solution.
    for(int i=1;i<w;i++){
        int j = w - i;
        if(i%2==0 && j%2==0)return "YES";
    }
    return "NO";
}
void check(int w, string myAnswer, string correctAnswer){
    // This function acts as the checker.
    if(myAnswer == correctAnswer)return;
    cout<<"Found the WA test"<<endl;
    cout<<"W = "<<w<<endl;
    cout<<"myAnswer = "<<myAnswer<<endl;
    cout<<"correctAnswer = "<<correctAnswer<<endl;
    exit(0);
}
int main() {
    for(int i=1;;i++){
        int w = generator();
        string myAnswer = solve(w);
        string correctAnswer = bruteForce(w);
        check(w, myAnswer, correctAnswer);
        cout<<"Passed test: "<<i<<endl;
    }
}
{% endhighlight %}
---
After running this code you will pass some tests, eventually you will find the WA test, and you will get something like this:
~~~~~
Found the WA test
W = 2
myAnswer = YES
correctAnswer = NO
~~~~~
I don't recommend using this implementation for many reasons, first of all it's really messy and hard to maintain, also in some harder problems you might have to use some global arrays or data structures for both the brute force and the tested solution and things might get out of control, the solution for that is to use a `bash script` to run each code individually. In the next section we will see how to efficiently implement this.

## Putting things together (good implementation)
A Bash script is a plain text file with the extension **.sh** which contains a series of commands. These commands are a mixture of commands we would normally type on the command line. When you run the script these commands will do the same thing as if you type them on the command line. In our previous problem we will have to run different programs each receiving some arguments or input from different files, and printing output to other files. Similar to the process we mentioned before, first we run the generator file, in our implementation the generator will receive **seed** as an argument passed from the script and print the generated test to file `input_file`. Both the tested solution and the brute force solution will get this file as an input and print the output to files `myAnswer` and `correctAnswer` respectively. As this problem is a one output problem then no need to use a checker, instead the `diff` function will check if the files match.

The script file will look like:
{% highlight bash linenos %}
set -e
g++ code.cpp -o code
g++ gen.cpp -o gen
g++ brute.cpp -o brute
for((i = 1; ; ++i)); do
    ./gen $i > input_file
    ./code < input_file > myAnswer
    ./brute < input_file > correctAnswer
    diff -w myAnswer correctAnswer > /dev/null || break
    echo "Passed test: "  $i
done
echo "WA on the following test:"
cat input_file
echo "Your answer is:"
cat myAnswer
echo "Correct answer is:"
cat correctAnswer
{% endhighlight %}
After running the script using `bash script.sh` you will get the following output:
~~~~~
WA on the following test:
2
Your answer is:
YES
Correct answer is:
NO
~~~~~

## Use checker
In some problems more than one answer is accepted so you can't use the `diff` function, Let's take this [problem](https://codeforces.com/contest/4/problem/A) as an example. In this problem You're given an array $$a$$ of length $$2n$$. You have to find if it's possible to reorder it in such way so that the sum of the first $$n$$ elements isn't equal to the sum of the last $$n$$ elements. Now I have chosen one solution that fails on test 32 to stress test it, I have chosen this solution randomly so I am sorry if this was your solution. The code is:
{% highlight cpp linenos %}
#include<bits/stdc++.h>
using namespace std;
long long a[200005];
int main(){
	long long n;
	cin>>n;
	long long sum2 = 0;
	for(long long i = 1;i<=2*n;i++){
		cin>>a[i];
		sum2+=a[i];
	}
	sort(a+1,a+1+2*n);
	long long sum=0;
	for(long long i = 1;i<=n;i++){
		sum+=a[i];
	}
	if(sum==sum2/2) cout<<"-1";
	else for(long long i = 1;i<=2*n;i++) cout<<a[i]<<" ";
	cout<<endl;
}
{% endhighlight %}
---
Let's start by writing the brute force solution:
{% highlight cpp linenos %}
#include<bits/stdc++.h>
using namespace std;
int main(){
    int n;
    cin>>n;
    vector<int>a(2*n);
    for(int i=0;i<2*n;i++)cin>>a[i];
    sort(a.begin(), a.end());
    do{
        int s1 = 0, s2 = 0;
        for(int i=0;i<n;i++){
            s1+=a[i];
            s2+=a[i+n];
        }
        if(s1!=s2){
            for(auto x:a)cout<<x<<" "; cout<<endl;
            exit(0);
        }
    }while(next_permutation(a.begin(), a.end()));
    cout<<-1<<endl;
}
{% endhighlight %}
---
And the generator:
{% highlight cpp linenos %}
#include <bits/stdc++.h>
using namespace std;
int rnd(int a, int b){
    return a + rand() % (b - a + 1);
}
int main(int argc, char* argv[]){
    int seed = atoi(argv[1]);
    srand(seed);
    int n = rnd(1, 5);
    cout<<n<<endl;
    for(int i=0;i<2*n;i++){
        int x = rnd(1, 10);
        cout<<x<<" ";
    }
    cout<<endl;
}
{% endhighlight %}
---
The checker must check more than one thing, if there is a solution of no solution, and if there is a solution then it must be valid, by valid I mean that the sum of the first $$n$$ elements isn't equal to the sum of the last $$n$$ elements. Also the printed array must be a valid permutation of the input array. Let's see how the checker code will look like:

{% highlight cpp linenos %}
#include<bits/stdc++.h>
#define pb push_back
using namespace std;
int a[22];
int b[22];
int n;
int readAns(ifstream &fin){
    int ans;
    fin>>ans;
    if(ans==-1)return ans;
    b[0] = ans;
    for(int i=1;i<2*n;i++)fin>>b[i];
    int s1 = 0, s2 = 0;
    for(int i=0;i<n;i++){
        s1+=b[i];
        s2+=b[i+n];
    }
    if(s1==s2)return -2;                // Sums are equal
    sort(b,b+2*n);
    for(int i=0;i<2*n;i++){
        if(a[i]!=b[i])return 0;         // Printing another array
    }
    return 1;                           // Correct answer
}
int main(int argc, char * argv[]){
    ifstream fin("input_file", ifstream::in);
    ifstream ans("myAnswer", ifstream::in);
    ifstream cor("correctAnswer", ifstream::in);
    fin>>n;
    for(int i=0;i<2*n;i++)fin>>a[i];
    sort(a,a+2*n);
    int myAnswer = readAns(ans);
    int correctAnswer = readAns(cor);
    if(myAnswer==-2){
        cout<<"WA Sums are equal"<<endl;
        return -1;
    }
    if(myAnswer==0){
        cout<<"WA Printing another array"<<endl;
        return -1;
    }
    if(myAnswer == -1 && correctAnswer == 1){
        cout<<"Brute force found a solution, but the code didn't find"<<endl;
        return -1;
    }
    return 0;
}
{% endhighlight %}
---
Finally the bash script will be:
{% highlight bash linenos %}
set -e
g++ code.cpp -o code
g++ gen.cpp -o gen
g++ brute.cpp -o brute
g++ checker.cpp -o checker
for((i = 1; ; ++i)); do
    ./gen $i > input_file
    ./code < input_file > myAnswer
    ./brute < input_file > correctAnswer
    ./checker > checker_log
    echo "Passed test: "  $i
done
{% endhighlight %}
---
Here the script will keep running until the returned value from the checker is equal to $$0$$ any nonzero value will make the script stop, this even includes compilition error while compiling the programs, to find the test case, your WA and the correct answer you can use `cat` command:
~~~~~
cat input_file
cat myAnswer
cat correctAnswer
~~~~~
After running the script, the code will pass some tests eventually failing with this:
~~~~~
WA on the following test:
1
10 9
Your answer is:
-1
Correct answer is:
9 10
Checker message:
Brute force found a solution, but the code didn't find
~~~~~
This is a small test case and you can easily find that the bug in your code is in line 17 when $$sum2$$ is an odd number.

| ![]({{site.url}}/assets/img/Stress Testing/1.jpeg)|
|:--:|
| Figure 1: The testing process flow |


## When to use Stress Testing?
Stress testing is a very powerful tool to find bugs in your code or mistakes in your idea, basically by finding a small test case that your code fails on then you can know what are you doing wrong, I used it to solve many problems, the most important one for me was this [problem](https://a2oj.com/p?ID=426) from ACM-ACPC Regional contest 2016. During the official contest I got stuck with WAs all the time, although I tried many other tests but still couldn't find the bug, I think the reason for that is when you try extra tests by hand then those tests are not completely random, because you are writing them, and as a human you can't be that random. However stress testing helps you overcome that issue. So make sure to use it every time you got stuck for long time with a problem without finding that WA test.

## Conclusion
In this article we started by defining stress testing, then briefly explained what a generator, validator and a checker mean and shown how these programs combine and work alongside with the problem solutions, next up we shown the need of a special solution called the brute force solution, then we presented an example problem and shown how to stress test it in a bad implemented way, improved the implementation using bash scripts, and moved on to show how to use checker with problems having multiple correct answers, finally we have shown when to use stress testing.

All the codes in this article can be found [here.](https://github.com/Ali-Ibrahim137/Competitive-Programming/tree/master/Articles/Stress%20Testing)

I hope you liked this article, please stay tuned for more.
